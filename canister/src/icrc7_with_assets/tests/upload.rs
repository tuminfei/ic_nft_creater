/// 上传文件

// 调用身份
const IDENTITY: &str = "deploy";
// 部署位置
// const NETWORK: &str = "local";
const NETWORK: &str = "ic";
// 本地需要同步的文件夹
// const ASSETS_DIR: &str = "assets";
const ASSETS_DIR: &str = "assets";
// const ASSETS_DIR: &str = "empty"; // 删除所有数据
// const ASSETS_DIR: &str = "assets-test"; // 测试数据
// 忽略的文件或目录, 后缀匹配
const IGNORE_FILES: [&str; 4] = [".DS_Store", ".gitkeep", ".gitignore", ".git"];
// 固定上传长度 接近 1.9M
const CHUNK_SIZE: u64 = 1024 * 1024 * 2 - 1024 * 128;

// 本地文件信息
#[derive(Debug, Clone)]
struct LocalFile {
    pub path: String,
    pub size: u64,
    pub headers: Vec<(String, String)>,
    pub modified: u64,
    pub hash: String,
    pub data: Vec<u8>,
}
// 远程文件信息
#[allow(dead_code)]
#[derive(Debug)]
struct RemoteFile {
    pub path: String,
    pub size: u64,
    pub headers: Vec<(String, String)>,
    pub created: u64,
    pub modified: u64,
    pub hash: String,
}

// 上传参数
#[derive(Debug)]
struct UploadFile {
    pub file: std::sync::Arc<LocalFile>,
    pub chunks: u64,       //  总块数
    pub chunk_size: u64,   // 块大小
    pub index: u64,        // 序号
    pub offset: usize,     // 起始偏移
    pub offset_end: usize, // 末位
}

// 根据拓展名设置对应的 Content-Type 内容
const EXT_CONTENT_TYPES: [(&str, &str); 50] = [
    ("txt", "text/plain"), // 文本
    ("html", "text/html"),
    ("htm", "text/html"),
    ("htx", "text/html"),
    ("xhtml", "text/html"),
    ("css", "text/css"),
    ("js", "text/javascript"),
    ("md", "text/markdown"),
    ("ics", "text/calendar"),
    ("csv", "text/csv"),
    ("xml", "text/xml"),
    ("json", "application/json"), // 应用
    ("pdf", "application/pdf"),
    ("zip", "application/zip"),
    ("prefab", "application/zip"),
    ("7z", "application/x-7z-compressed"),
    ("eot", "application/vnd.ms-fontobject"), // 字体
    ("png", "image/png"),                     // 图片
    ("gif", "image/gif"),
    ("jpg", "image/jpeg"),
    ("jpeg", "image/jpeg"),
    ("svg", "image/svg+xml"),
    ("webp", "image/webp"),
    ("tif", "image/tiff"),
    ("tiff", "image/tiff"),
    ("ico", "image/x-icon"),
    ("mp4", "video/mp4"), // 视频
    ("avi", "video/x-msvideo"),
    ("mov", "video/quicktime"),
    ("mpeg", "video/mpeg"),
    ("ogv", "video/ogg"),
    ("webm", "video/webm"),
    ("mp3", "audio/mp3"), // 音频
    ("wav", "audio/wav"),
    ("flac", "audio/flac"),
    ("aac", "audio/aac"),
    ("webm", "audio/webm"),
    ("oga", "audio/ogg"),
    ("wma", "audio/x-ms-wma"),
    ("mid", "audio/midi"),
    ("midi", "audio/midi"),
    ("ra", "audio/x-realaudio"),
    ("ram", "audio/x-realaudio"),
    ("otf", "font/otf"), // 字体
    ("ttf", "font/ttf"),
    ("woff", "font/woff"),
    ("woff2", "font/woff2"),
    ("dat", ""), // 其他
    ("plot", ""),
    ("cache", ""),
];

#[test]
fn upload() {
    // 1. 读取本地数据
    let mut local_files: Vec<LocalFile> = vec![];
    load_local_files(ASSETS_DIR, ASSETS_DIR, &mut local_files);
    let local_file_names: Vec<String> = local_files.iter().map(|f| f.path.clone()).collect();
    // for file in local_files.iter() {
    //     println!("{} -> {}", file.path, file.size);
    // }
    // // 筛选有哪些拓展名
    // use std::collections::HashSet;
    // let mut ext_set = HashSet::new();
    // for file in local_files.iter() {
    //     let mut s = file.path.split(".");
    //     let mut ext = "";
    //     while let Some(e) = s.next() {
    //         ext = e;
    //     }
    //     ext_set.insert(ext.to_string());
    // }
    // for ext in ext_set.iter() {
    //     println!("ext -> {ext}");
    // }

    // 2. 读取线上数据
    let remote_files = load_remote_files();
    // println!("remote files: {:?}", remote_files);

    // 3. 比较远程有但是本地没有的要删除
    let deletes: Vec<String> = remote_files
        .iter()
        .map(|f| f.path.clone())
        .filter(|p| !local_file_names.contains(p)) // 远程存在, 但本地不存在
        .collect();
    if !deletes.is_empty() {
        delete_files(deletes);
    }

    // 4. 比较本地有但是远程不一样的要进行上传
    let local_files: Vec<LocalFile> = local_files
        .into_iter()
        .filter(|local_file| {
            let remote_file = remote_files.iter().find(|f| f.path == local_file.path);
            if remote_file.is_none() {
                return true; // 本地有, 远程没有
            }
            let remote_file = remote_file.unwrap();
            // 有文件就比较一下其他信息是否一致
            let mut file_headers: Vec<String> = local_file
                .headers
                .iter()
                .map(|h| format!("{}:{}", h.0, h.1))
                .collect();
            file_headers.sort();
            let mut remote_file_headers: Vec<String> = remote_file
                .headers
                .iter()
                .map(|h| format!("{}:{}", h.0, h.1))
                .collect();
            remote_file_headers.sort();
            let changed = local_file.size != remote_file.size
                || file_headers.join(";") != remote_file_headers.join(";")
                || local_file.hash != remote_file.hash // 本地文件有修改
                || remote_file.modified < local_file.modified * 1000000; // 本地时间是新的
            if !changed {
                println!("file: {} has not changed. do nothing.", local_file.path)
            }
            changed
        })
        .collect();
    if local_files.is_empty() {
        println!("Nothing to do");
        return;
    }
    upload_files(local_files);
}

// =========== 读取本地文件 ===========

fn load_local_files(prefix: &str, dir_path: &str, files: &mut Vec<LocalFile>) {
    let entries = std::fs::read_dir(dir_path).unwrap();

    for entry in entries {
        let entry = entry.unwrap();
        let file_name = entry.file_name();
        let file_type = entry.file_type().unwrap();

        let path = format!("{}/{}", dir_path, file_name.to_str().unwrap().to_string());
        fn is_ignore(path: &str) -> bool {
            for ignore in IGNORE_FILES {
                if path.ends_with(ignore) {
                    return true;
                }
            }
            false
        }

        if is_ignore(&path) {
            continue; // 是否是被忽略的文件或目录
        }

        if file_type.is_file() {
            let mut file = load_local_file(&path);
            file.path = (&file.path[prefix.len()..]).to_string();
            files.push(file);
        } else if file_type.is_dir() {
            // 目录还需要进行递归
            load_local_files(prefix, &path, files);
        }
    }
}

fn load_local_file(path: &str) -> LocalFile {
    // 获取文件大小
    let metadata = std::fs::metadata(path).unwrap();
    let file_size = metadata.len();

    use std::time::UNIX_EPOCH;
    let modified_time = metadata
        .modified()
        .unwrap()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    // 读取文件内容
    let mut file = std::fs::File::open(path).unwrap();
    let mut buffer = Vec::new();
    use std::io::Read;
    file.read_to_end(&mut buffer).unwrap();

    LocalFile {
        path: path.to_string(),
        size: file_size,
        headers: get_headers(&path),
        modified: modified_time as u64, // 修改时间就是创建时间
        hash: do_hash(&buffer),
        data: buffer,
    }
}

fn do_hash(data: &Vec<u8>) -> String {
    use sha2::Digest;
    let mut hasher = sha2::Sha256::new();
    hasher.update(&data[..]);
    let digest: [u8; 32] = hasher.finalize().into();
    hex::encode(&digest)
}

// 获取文件的 headers
fn get_headers(file: &str) -> Vec<(String, String)> {
    let mut headers: Vec<(String, String)> = vec![];

    let mut content_type: String = String::from("");

    use std::path::Path;
    let file_path = Path::new(file);
    if let Some(extension) = file_path.extension() {
        if let Some(ext_str) = extension.to_str() {
            let file_name = file.to_string();
            let ext = ext_str.to_lowercase();

            fn get_content_type(ext_str: &str) -> String {
                for (ext, content) in EXT_CONTENT_TYPES {
                    if ext == ext_str {
                        return content.to_string();
                    }
                }
                panic!("Unknown file type: {}", ext_str);
            }

            if &ext == "gz" {
                // gz 需要额外取前面的拓展名
                let mut ext = "";
                let mut s = (&file_name[0..(file_name.len() - 3)]).split(".");
                while let Some(e) = s.next() {
                    ext = e;
                }
                content_type = get_content_type(ext);
            } else {
                content_type = get_content_type(&ext);
            }
        } else {
            println!("Invalid extension");
        }
    } else {
        println!("No extension: {}", file);
    }

    // 内容类型
    if !content_type.is_empty() {
        headers.push(("Content-Type".to_string(), content_type.to_string()));
    }

    // 缓存时间
    headers.push((
        "Cache-Control".to_string(),
        "public, max-age=31536000".to_string(),
    ));

    // gzip
    if file.ends_with(".gz") {
        headers.push(("Content-Encoding".to_string(), "gzip".to_string()));
    }

    headers
}

// =========== 读取远程文件 ===========

fn load_remote_files() -> Vec<RemoteFile> {
    use std::process::Command;

    let _start = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    let output = Command::new("/usr/local/bin/dfx")
        .current_dir(".")
        .arg("--identity")
        .arg(IDENTITY)
        .arg("canister")
        .arg("--network")
        .arg(NETWORK)
        .arg("call")
        .arg("icrc7_with_assets")
        .arg("assets_files")
        .arg("()")
        .arg("--output")
        .arg("idl")
        .output()
        .expect("error");

    let _end = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    // println!("api: {} -> {:?}", "files", _end - _start);
    // println!("status: {}", output.status);

    if format!("{}", output.status).eq("exit status: 0") {
        let output = String::from_utf8(output.stdout.clone()).unwrap();
        // println!("output: {}", output);
        return parse_remote_files(output);
    }

    eprintln!(">>>>>>>>>> ERROR <<<<<<<<<<<");
    eprintln!("identity: {}", IDENTITY);
    eprintln!("api: {}", "files");
    eprintln!("arg: {}", "");
    eprintln!("status: {}", output.status);
    if format!("{}", output.status).eq("exit status: 0") {
        eprintln!(
            "output: {}",
            String::from_utf8(output.stdout).unwrap().trim_end()
        );
    } else {
        eprintln!(
            "error : {}",
            String::from_utf8(output.stderr).unwrap().trim_end()
        );
    }
    panic!("error");
}

fn parse_remote_files(output: String) -> Vec<RemoteFile> {
    let output = output.trim();
    let output = (&output[6..(output.len() - 2)]).to_string();
    let output = output.trim();

    if output.len() == 0 {
        return vec![];
    }

    let output = (&output[9..(output.len() - 4)]).to_string();
    let output = output.trim();

    let mut files = vec![];
    let mut splitted = output.split("};}; record { ");
    while let Some(content) = splitted.next() {
        // 解析 created
        let content = (&content[10..]).to_string();
        let created: u64 = content
            .split(r#" : nat64; modified = "#)
            .next()
            .unwrap()
            .to_string()
            .replace("_", "")
            .parse()
            .unwrap();
        let mut content = content.split(r#" : nat64; modified = "#);
        content.next();
        let content = content.next().unwrap();
        // 解析 modified
        let modified: u64 = content
            .split(r#" : nat64; hash = ""#)
            .next()
            .unwrap()
            .to_string()
            .replace("_", "")
            .parse()
            .unwrap();
        let mut content = content.split(r#" : nat64; hash = ""#);
        content.next();
        let content = content.next().unwrap();
        // 解析 hash
        let hash = (&content[0..64]).to_string();
        let mut content = content.split(r#""; path = ""#);
        content.next();
        let content = content.next().unwrap();
        // 解析 path
        let path = content.split(r#""; size = "#).next().unwrap().to_string();
        let mut content = content.split(r#""; size = "#);
        content.next();
        let content = content.next().unwrap();
        // 解析 size
        let size: u64 = content
            .split(r#" : nat64; headers = "#)
            .next()
            .unwrap()
            .to_string()
            .replace("_", "")
            .parse()
            .unwrap();
        let mut content = content.split(r#" : nat64; headers = "#);
        content.next();
        let content = content.next().unwrap();
        // 解析 headers
        let headers: Vec<(String, String)> = if 5 < content.len() {
            let content = &content[16..(content.len() - 4)];
            let mut headers = vec![];
            let mut cs = content.split(r#"";}; record { ""#);
            while let Some(s) = cs.next() {
                let mut ss = s.split(r#""; ""#);
                let key = ss.next().unwrap().to_string();
                let value = ss.next().unwrap().to_string();
                headers.push((key, value));
            }
            headers
        } else {
            vec![]
        };
        // 返回解析的一个文件对象
        files.push(RemoteFile {
            path,
            size,
            headers,
            created,
            modified,
            hash,
        });
    }
    files
}

// =========== 删除文件 ===========

fn delete_files(names: Vec<String>) {
    use std::process::Command;

    let _start = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    let args = format!(
        "(vec {{{}}})",
        names
            .iter()
            .map(|name| format!("\"{}\"", name))
            .collect::<Vec<String>>()
            .join(";")
    );

    let output = Command::new("/usr/local/bin/dfx")
        .current_dir(".")
        .arg("--identity")
        .arg(IDENTITY)
        .arg("canister")
        .arg("--network")
        .arg(NETWORK)
        .arg("call")
        .arg("icrc7_with_assets")
        .arg("assets_delete")
        .arg(&args)
        .arg("--output")
        .arg("idl")
        .output()
        .expect("error");

    let _end = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    if format!("{}", output.status).eq("exit status: 0") {
        for name in names.iter() {
            println!("delete file: {}", name)
        }
        return;
    }

    eprintln!(">>>>>>>>>> ERROR <<<<<<<<<<<");
    eprintln!("identity: {}", IDENTITY);
    eprintln!("api: {}", "delete");
    eprintln!("arg: {}", args);
    eprintln!("status: {}", output.status);
    if format!("{}", output.status).eq("exit status: 0") {
        eprintln!(
            "output: {}",
            String::from_utf8(output.stdout).unwrap().trim_end()
        );
    } else {
        eprintln!(
            "error : {}",
            String::from_utf8(output.stderr).unwrap().trim_end()
        );
    }
    panic!("error");
}

// =========== 上传文件 ===========

fn upload_files(local_files: Vec<LocalFile>) {
    let local_files = local_files
        .into_iter()
        .map(|f| std::sync::Arc::new(f))
        .collect::<Vec<_>>();
    let mut upload_files: Vec<Vec<UploadFile>> = vec![];

    let mut all_count = 0;
    let mut count = 0;
    let mut upload_file: Vec<UploadFile> = vec![];
    for file in local_files.iter() {
        let size = file.size;
        let mut splitted = size / CHUNK_SIZE;
        if splitted * CHUNK_SIZE < size {
            splitted += 1;
        }
        for i in 0..splitted {
            let (current_size, offset, offset_end) = if i < splitted - 1 {
                (CHUNK_SIZE, CHUNK_SIZE * i, CHUNK_SIZE * (i + 1)) // 前面完整的
            } else {
                (size - (splitted - 1) * CHUNK_SIZE, CHUNK_SIZE * i, size) // 最后一个
            };
            if CHUNK_SIZE < count + current_size {
                // 下一个就超出了
                upload_files.push(upload_file);
                count = 0;
                upload_file = vec![]
            }
            // 本次也要加入
            count += current_size;
            all_count += current_size;
            upload_file.push(UploadFile {
                file: file.clone(),
                chunks: splitted,
                chunk_size: CHUNK_SIZE,
                index: i,
                offset: offset as usize,
                offset_end: offset_end as usize,
            });
        }
    }
    if !upload_file.is_empty() {
        upload_files.push(upload_file); // 剩下的也要加入
    }
    // 记录开始时间
    use std::time::{SystemTime, UNIX_EPOCH};
    let start = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();

    for (i, upload_file) in upload_files.into_iter().enumerate() {
        do_upload_file(&upload_file, i);
    }
    
    // 记录结束时间
    let end = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    println!(
        "all done: total: {:.2}MB time: {}s average: {:.2}MB/s",
        all_count as f64 / 1024f64 / 1024f64,
        (end - start) / 1000,
        all_count as f64 / 1024f64 / 1024f64 / (((end - start) / 1000) as f64)
    );
}

fn do_upload_file(local_files: &Vec<UploadFile>, index: usize) {
    // 1. 保存参数到文件
    let mut arg = String::from("");
    arg.push_str("(vec{");
    arg.push_str(
        &local_files
            .iter()
            .map(|file| {
                format!(
                    "record{{ path=\"{}\"; headers=vec{{{}}}; size={}:nat64; chunk_size={}:nat64; index={}:nat32; chunk=vec{{{}}} }}",
                    file.file.path,
                    file.file
                        .headers
                        .iter()
                        .map(|header| { format!("record{{\"{}\";\"{}\"}}", header.0, header.1) })
                        .collect::<Vec<String>>()
                        .join(";"),
                    file.file.size,
                    file.chunk_size,
                    file.index,
                    (&file.file.data[file.offset..file.offset_end]).iter().map(|u|format!("{}:nat8", u)).collect::<Vec<String>>().join(";")
                )
            })
            .collect::<Vec<String>>()
            .join(";"),
    );
    arg.push_str("})");
    let arg_file = format!(".args.{}.temp", index);
    write_file(&arg_file, &arg); // 写入临时文件

    // 2. 执行上传脚本
    let r = do_upload_file_to_canister(&arg_file, local_files);
    if let Err(msg) = r {
        println!("{}. try again", msg);
        // 失败了, 就再试一次
        do_upload_file_to_canister(&arg_file, local_files).unwrap();
    }

    // 3. 用完文件要删除
    std::fs::remove_file(arg_file).unwrap();
}

fn write_file(path: &str, content: &str) {
    use std::io::Write;
    if let Ok(_) = std::fs::File::open(path) {
        std::fs::remove_file(path).unwrap();
    }
    std::fs::File::create(&path)
        .expect("create failed")
        .write_all(content.as_bytes())
        .expect("write candid failed");
}

fn do_upload_file_to_canister(arg: &str, local_files: &Vec<UploadFile>) -> Result<(), String> {
    use std::process::Command;

    let _start = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    let output = Command::new("/usr/local/bin/dfx")
        .current_dir(".")
        .arg("--identity")
        .arg(IDENTITY)
        .arg("canister")
        .arg("--network")
        .arg(NETWORK)
        .arg("call")
        .arg("--argument-file")
        .arg(arg)
        .arg("icrc7_with_assets")
        .arg("assets_upload")
        .arg("--output")
        .arg("idl")
        .output();
    if let Err(_) = output {
        return Err("Upload failed".to_string());
    }
    let output = output.unwrap();

    let _end = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");

    if format!("{}", output.status).eq("exit status: 0") {
        // 上传成功, 需要展示结果
        for file in local_files.iter() {
            println!(
                "upload file: {} {}/{} ({} bytes) hash: {}",
                file.file.path,
                file.index + 1,
                file.chunks,
                file.offset_end - file.offset,
                file.file.hash
            )
        }
        return Ok({});
    }

    eprintln!(">>>>>>>>>> ERROR <<<<<<<<<<<");
    eprintln!("identity: {}", IDENTITY);
    eprintln!("api: {}", "upload");
    eprintln!("arg: {}", arg);
    eprintln!("status: {}", output.status);
    if format!("{}", output.status).eq("exit status: 0") {
        eprintln!(
            "output: {}",
            String::from_utf8(output.stdout).unwrap().trim_end()
        );
    } else {
        eprintln!(
            "error : {}",
            String::from_utf8(output.stderr).unwrap().trim_end()
        );
    }
    Err("Upload failed".to_string())
}

