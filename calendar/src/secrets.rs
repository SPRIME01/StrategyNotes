//! SecretStore port + a file-backed fallback (dev/testing only). Production
//! wires Tauri Stronghold (src-tauri). Secrets never live in SQLite - only
//! secret *references* do (per the spec's INV-CAL-adjacent rule).

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::Mutex;

/// Abstract secret storage. Stronghold (Tauri) in production; FileSecretStore
/// for non-Tauri/testing.
pub trait SecretStore: Send + Sync {
    fn put_secret(&self, key: &str, value: &str) -> Result<(), String>;
    fn get_secret(&self, key: &str) -> Result<Option<String>, String>;
    fn delete_secret(&self, key: &str) -> Result<(), String>;
}

/// Plaintext JSON file secret store. **Dev/testing only** - not secure.
/// Production must wire `StrongholdSecretStore` (src-tauri) instead.
#[derive(Debug)]
pub struct FileSecretStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl FileSecretStore {
    pub fn open(path: impl AsRef<std::path::Path>) -> Result<Self, String> {
        let path = path.as_ref().to_path_buf();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        if !path.exists() {
            std::fs::write(&path, "{}").map_err(|e| e.to_string())?;
        }
        Ok(Self { path, lock: Mutex::new(()) })
    }

    fn load(&self) -> Result<BTreeMap<String, String>, String> {
        let text = std::fs::read_to_string(&self.path).map_err(|e| e.to_string())?;
        if text.trim().is_empty() {
            Ok(BTreeMap::new())
        } else {
            serde_json::from_str(&text).map_err(|e| e.to_string())
        }
    }

    fn save(&self, map: &BTreeMap<String, String>) -> Result<(), String> {
        let text = serde_json::to_string_pretty(map).map_err(|e| e.to_string())?;
        std::fs::write(&self.path, text).map_err(|e| e.to_string())
    }
}

impl SecretStore for FileSecretStore {
    fn put_secret(&self, key: &str, value: &str) -> Result<(), String> {
        let _g = self.lock.lock().unwrap();
        let mut map = self.load()?;
        map.insert(key.to_string(), value.to_string());
        self.save(&map)
    }
    fn get_secret(&self, key: &str) -> Result<Option<String>, String> {
        let _g = self.lock.lock().unwrap();
        Ok(self.load()?.get(key).cloned())
    }
    fn delete_secret(&self, key: &str) -> Result<(), String> {
        let _g = self.lock.lock().unwrap();
        let mut map = self.load()?;
        map.remove(key);
        self.save(&map)
    }
}
