use std::collections::HashMap;

use candid::{CandidType, Deserialize};
use ic_canister_kit::{
    times::{now, Timestamp},
    types::Stable,
};

#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct AssetData {
    pub hash: String,
    pub size: u64,
    pub data: Vec<u8>,
}

#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct AssetFile {
    pub path: String,
    pub created: Timestamp,
    pub modified: Timestamp,
    pub headers: Vec<(String, String)>,
    pub hash: String,
}

#[derive(Default, Debug, Clone)]
pub struct CoreAssets {
    pub assets: HashMap<String, AssetData>, 
    pub files: HashMap<String, AssetFile>,
    hashes: HashMap<String, Vec<String>>,
}

pub type CoreAssetsState = (Vec<AssetData>, Vec<AssetFile>);

impl Stable<CoreAssetsState, CoreAssetsState> for CoreAssets {
    fn store(&mut self) -> CoreAssetsState {
        let assets = std::mem::take(&mut self.assets);
        let assets = assets.into_iter().map(|(_, asset)| asset).collect();
        let files = std::mem::take(&mut self.files);
        let files = files.into_iter().map(|(_, file)| file).collect();
        (assets, files)
    }

    fn restore(&mut self, restore: CoreAssetsState) {
        // assets: hash -> data
        let assets = restore.0;
        let assets = assets
            .into_iter()
            .map(|asset| (asset.hash.clone(), asset))
            .collect();
        // files: path -> hash
        let files = restore.1;
        let files: HashMap<String, AssetFile> = files
            .into_iter()
            .map(|file| (file.path.clone(), file))
            .collect();
        // hashes: hash -> [path]
        self.hashes.clear();
        for (path, file) in files.iter() {
            if !self.hashes.contains_key(&file.hash) {
                self.hashes.insert(file.hash.clone(), vec![]);
            }
            let hash_path = self.hashes.get_mut(&file.hash).unwrap();
            hash_path.push(path.clone());
        }
        let _ = std::mem::replace(&mut self.assets, assets);
        let _ = std::mem::replace(&mut self.files, files);
    }
}

impl CoreAssets {
    pub fn hash(file: &UploadingFile) -> String {
        use sha2::Digest;
        let mut hasher = sha2::Sha256::new();
        hasher.update(&file.data[0..(file.size as usize)]);
        let digest: [u8; 32] = hasher.finalize().into();
        hex::encode(&digest)
    }
    pub fn put(&mut self, file: &UploadingFile) {
        let hash = CoreAssets::hash(file);
        if !self.assets.contains_key(&hash) {
            let data = (&file.data[0..(file.size as usize)]).to_vec();
            self.assets.insert(
                hash.clone(),
                AssetData {
                    hash: hash.clone(),
                    size: file.size,
                    data,
                },
            );
        }

        let now = now();
        if self.files.contains_key(&file.path) {
            let exist = self.files.get_mut(&file.path).unwrap();
            exist.modified = now;
            exist.headers = file.headers.clone();
            exist.hash = hash.clone();
        } else {
            self.files.insert(
                file.path.clone(),
                AssetFile {
                    path: file.path.clone(),
                    created: now,
                    modified: now,
                    headers: file.headers.clone(),
                    hash: hash.clone(),
                },
            );
        }

        if !self.hashes.contains_key(&hash) {
            self.hashes.insert(hash.clone(), vec![]);
        }
        let hash_path = self.hashes.get_mut(&hash).unwrap();
        if !hash_path.contains(&file.path) {
            hash_path.push(file.path.clone());
        }
    }
    pub fn clean(&mut self, path: &String) {
        let file = self.files.get(path);
        if let None = file {
            return;
        }
        let file: AssetFile = file.unwrap().clone();
        self.files.remove(path);
        let path_list = self.hashes.get_mut(&file.hash).unwrap();
        let path_list: Vec<String> = path_list
            .clone()
            .into_iter()
            .filter(|p| p != &file.path)
            .collect();
        if path_list.is_empty() {
            self.hashes.remove(&file.hash);
            self.assets.remove(&file.hash);
        } else {
            self.hashes.insert(file.hash.clone(), path_list);
        }
    }
    pub fn files(&self) -> Vec<QueryFile> {
        self.files
            .iter()
            .map(|(path, file)| {
                let asset = self.assets.get(&file.hash).unwrap();
                QueryFile {
                    path: path.to_string(),
                    size: asset.size,
                    headers: file.headers.clone(),
                    created: file.created,
                    modified: file.modified,
                    hash: file.hash.clone(),
                }
            })
            .collect()
    }
    pub fn download(&self, path: String) -> Vec<u8> {
        let file = self.files.get(&path).expect("File not found");
        let asset = self.assets.get(&file.hash).expect("File not found");
        asset.data.clone()
    }
    pub fn download_by(&self, path: String, offset: u64, offset_end: u64) -> Vec<u8> {
        let file = self.files.get(&path).expect("File not found");
        let asset = self.assets.get(&file.hash).expect("File not found");
        (&asset.data[(offset as usize)..(offset_end as usize)]).to_vec()
    }
}

#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct QueryFile {
    pub path: String,
    pub size: u64,
    pub headers: Vec<(String, String)>,
    pub created: Timestamp,
    pub modified: Timestamp,
    pub hash: String,
}

// =========== 上传过程中的对象 ===========

#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct UploadingFile {
    pub path: String,
    pub headers: Vec<(String, String)>,
    pub data: Vec<u8>, // 上传中的数据

    pub size: u64,          // 文件大小
    pub chunk_size: u64,    // 块大小
    pub chunks: u32,        // 需要上传的次数
    pub chunked: Vec<bool>, // 记录每一个块的上传状态
}

// 需要存储的对象
#[derive(Default, Debug, Clone)]
pub struct UploadingAssets {
    files: HashMap<String, UploadingFile>, // key 是 path
}

pub type UploadingAssetsState = (Vec<UploadingFile>,);

impl Stable<UploadingAssetsState, UploadingAssetsState> for UploadingAssets {
    fn store(&mut self) -> UploadingAssetsState {
        let files = std::mem::take(&mut self.files);
        let files = files.into_iter().map(|(_, file)| file).collect();
        (files,)
    }

    fn restore(&mut self, restore: UploadingAssetsState) {
        let files = restore.0;
        let files = files
            .into_iter()
            .map(|file| (file.path.clone(), file))
            .collect();
        let _ = std::mem::replace(&mut self.files, files);
    }
}

// 上传参数
#[derive(CandidType, Deserialize, Default, Debug, Clone)]
pub struct UploadingArg {
    pub path: String,
    pub headers: Vec<(String, String)>, // 使用的 header
    pub size: u64,                      // 文件大小
    pub chunk_size: u64,                // 块大小
    pub index: u32,                     // 本次上传的数据
    pub chunk: Vec<u8>,                 // 上传中的数据
}

impl UploadingAssets {
    fn chunks(arg: &UploadingArg) -> u32 {
        let mut chunks = arg.size / arg.chunk_size; // 完整的块数
        if chunks * arg.chunk_size < arg.size {
            chunks += 1;
        }
        chunks as u32
    }
    fn offset(arg: &UploadingArg) -> (usize, usize) {
        let chunks = UploadingAssets::chunks(&arg);
        let offset = arg.chunk_size * arg.index as u64;
        let mut offset_end = offset + arg.chunk_size;
        if arg.index == chunks - 1 {
            offset_end = arg.size;
        }
        (offset as usize, offset_end as usize)
    }
    fn check_arg(arg: &UploadingArg) {
        // 1. 检查 路径名
        assert!(!arg.path.is_empty(), "must has path");
        assert!(arg.path.starts_with("/"), "path must start with /");
        // 2. 检查 headers
        // 3. 检查 size
        assert!(0 < arg.size, "size can not be 0");
        assert!(
            arg.size <= 1024 * 1024 * 1024 * 4, // 最大文件 4G
            "size must less than 4GB"
        );
        // 4. 检查 chunk_size
        assert!(0 < arg.chunk_size, "chunk size can not be 0");
        // 5. 检查 index
        let chunks = UploadingAssets::chunks(&arg);
        assert!(arg.index < chunks, "wrong index");
        // 6. 检查 data
        if arg.index < chunks - 1 || arg.size == arg.chunk_size * chunks as u64 {
            // 是前面完整的 或者 整好整除
            assert!(
                arg.chunk.len() as u64 == arg.chunk_size,
                "wrong chunk length"
            );
        } else {
            // 是剩下的
            assert!(
                arg.chunk.len() as u64 == arg.size % arg.chunk_size,
                "wrong chunk length"
            );
        }
    }
    fn check_file(&mut self, arg: &UploadingArg) {
        if self.files.contains_key(&arg.path) {
            // 已经有这个文件了, 需要比较一下, 参数是否一致
            let file = self.files.get(&arg.path).unwrap();
            assert!(arg.path == file.path, "wrong path, system error.");
            let chunks = UploadingAssets::chunks(&arg);
            if arg.size != file.size // 文件长度不一致
                || file.data.len() < file.size as usize // 暂存长度不对
                || arg.chunk_size != file.chunk_size
                || chunks != file.chunks
                || file.chunked.len() < file.chunks as usize
            {
                // 非致命错误, 清空原来的文件就好
                self.files.remove(&arg.path);
            }
        }
        if !self.files.contains_key(&arg.path) {
            // 原来没有的情况下
            let chunks = UploadingAssets::chunks(&arg);
            self.files.insert(
                arg.path.clone(),
                UploadingFile {
                    path: arg.path.clone(),
                    headers: arg.headers.clone(),
                    data: vec![0; arg.size as usize],
                    size: arg.size,
                    chunk_size: arg.chunk_size,
                    chunks,
                    chunked: vec![false; chunks as usize],
                },
            );
        }
    }
    pub fn put(&mut self, arg: UploadingArg) -> Option<&UploadingFile> {
        // 0. 检查参数是否有效
        UploadingAssets::check_arg(&arg);

        // 1. 检查文件
        self.check_file(&arg);

        // 2. 找的对应的缓存文件
        let file = self.files.get_mut(&arg.path).unwrap();

        // 3. 复制有效的信息
        let (offset, offset_end) = UploadingAssets::offset(&arg);
        file.headers = arg.headers;
        file.data.splice(offset..offset_end, arg.chunk); // 复制内容
        file.chunked[arg.index as usize] = true;

        // 4. 是否已经完整
        for uploaded in file.chunked.iter() {
            if !uploaded {
                return None; // 还有没上传的
            }
        }
        Some(file) // 已经完成的
    }
    pub fn clean(&mut self, path: &String) {
        self.files.remove(path);
    }
}
