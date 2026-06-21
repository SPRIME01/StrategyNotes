//! Markdown vault adapter - durable source-of-truth storage for nodes.
//!
//! Implements [`strategynotes_core::NodeVault`] by writing each node as a plain
//! markdown file (via [`strategynotes_core::format`]) under a vault directory,
//! one file per node, path = `<vault>/<node_id>.md` (INV-ID: path-mappable).
//!
//! Writes are atomic (write-temp-then-rename) so a crash mid-write cannot
//! corrupt the durable source of truth. Guards INV-DUR, INV-PORT, INV-EDGE.

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use strategynotes_core::format;
use strategynotes_core::node::{Node, TypedEdge};
use strategynotes_core::ports::NodeVault;
use strategynotes_core::Error;
use strategynotes_core::NodeId;

/// Filesystem-backed markdown vault. One file per node.
#[derive(Debug, Clone)]
pub struct MarkdownVault {
    root: PathBuf,
}

impl MarkdownVault {
    /// Open a vault at `root`, creating the directory if missing.
    pub fn open(root: impl AsRef<Path>) -> Result<Self, Error> {
        let root = root.as_ref().to_path_buf();
        fs::create_dir_all(&root).map_err(io_err)?;
        Ok(Self { root })
    }

    fn path_for(&self, id: &NodeId) -> PathBuf {
        self.root.join(format!("{}.md", id.to_lexical()))
    }

    /// Atomic write: serialize, write to a temp sibling, fsync, rename over.
    /// Crash safety: the destination is either the old file or the new file,
    /// never a partial write.
    fn write_atomic(&self, path: &Path, contents: &str) -> Result<(), Error> {
        let tmp = path.with_extension("md.tmp");
        {
            let mut f = fs::File::create(&tmp).map_err(io_err)?;
            f.write_all(contents.as_bytes()).map_err(io_err)?;
            f.sync_all().map_err(io_err)?;
        }
        fs::rename(&tmp, path).map_err(io_err)?;
        Ok(())
    }
}

impl NodeVault for MarkdownVault {
    fn get(&self, id: &NodeId) -> Result<Option<Node>, Error> {
        let path = self.path_for(id);
        match fs::read_to_string(&path) {
            Ok(text) => Ok(Some(format::from_markdown(&text)?)),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(io_err(e)),
        }
    }

    fn put(&self, node: &Node) -> Result<(), Error> {
        let path = self.path_for(&node.id);
        let text = format::to_markdown(node)?;
        self.write_atomic(&path, &text)
    }

    fn delete(&self, id: &NodeId) -> Result<(), Error> {
        let path = self.path_for(id);
        match fs::remove_file(&path) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(io_err(e)),
        }
    }

    fn all(&self) -> Result<Vec<Node>, Error> {
        let mut out = Vec::new();
        for entry in fs::read_dir(&self.root).map_err(io_err)? {
            let entry = entry.map_err(io_err)?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("md") {
                continue;
            }
            // Skip temp files from interrupted writes.
            if path.extension().and_then(|e| e.to_str()) == Some("tmp") {
                continue;
            }
            let text = fs::read_to_string(&path).map_err(io_err)?;
            out.push(format::from_markdown(&text)?);
        }
        Ok(out)
    }

    fn edges_of(&self, id: &NodeId) -> Result<Vec<TypedEdge>, Error> {
        let node = self.get(id)?;
        match node {
            Some(n) => format::edges_of(&n),
            None => Ok(Vec::new()),
        }
    }
}

fn io_err(e: std::io::Error) -> Error {
    Error::Contract(format!("vault i/o: {e}"))
}
