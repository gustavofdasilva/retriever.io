use std::{collections::HashMap, fs::{self, remove_file}, io::{BufReader, Read, Write}, path::Path};

use serde_json::{json, Value};
use tauri::utils::write_if_changed;
use tauri_plugin_http::reqwest;


#[tauri::command]
pub async fn get_binary_url_ytdlp(platform: String, version: String) -> String {
    if platform == "windows".to_string() {
        return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe".to_string();
    } else if platform == "macos".to_string() {
        if version < "10.15".to_string() {
            return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos_legacy".to_string();
        } else {
            return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos".to_string();
        }
    } else {
        return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp".to_string();
    }
}


#[tauri::command]
pub async fn get_binary_info_ff(platform: String) -> HashMap<String, String> {
    let mut binaryInfo: HashMap<String, String> = HashMap::new();
    let mut ff_platform = String::new();

    if platform == "windows".to_string() {
        ff_platform = "windows-64".to_string();
    } else if platform == "macos".to_string() {
        ff_platform = "osx-64".to_string();
    } else {
        ff_platform = "linux-64".to_string();
    }

    let release_url = "https://ffbinaries.com/api/v1/version/latest";

    let res = reqwest::get(release_url).await;

    match res {
        Ok(response) => {
            let json_value: Value = serde_json::from_str(&response.text_with_charset("utf-8").await.unwrap()).unwrap();

            let version = json_value["version"].as_str().unwrap_or("");
            let ffmpeg_url = json_value["bin"][&ff_platform]["ffmpeg"].as_str().unwrap_or("");
            let ffprobe_url = json_value["bin"][&ff_platform]["ffprobe"].as_str().unwrap_or("");

            binaryInfo.insert("version".to_string(), version.to_string());
            binaryInfo.insert("ffmpeg_url".to_string(), ffmpeg_url.to_string());
            binaryInfo.insert("ffprobe_url".to_string(), ffprobe_url.to_string());
        }
        Err(_) => {},
    }

    return binaryInfo;
}

#[tauri::command]
pub async fn get_remote_version_ytdlp() -> String {
    let release_url = "https://github.com/yt-dlp/yt-dlp/releases/latest/";

    let res = reqwest::get(release_url).await;

    match res {
        Ok(response) => {
            
            let version=response.url().path().split('/').last().unwrap(); 
            return version.to_string();
        }
        Err(_) => {return "NA".to_string();},
    }
}

#[tauri::command]	
pub async fn check_version_binary(binary_url: String, version: String, path: String) -> String {
    let name = binary_url.split('/').last().unwrap();

    let info_file_path = format!("{}/binaries/info.json", &path);

    if Path::new(&info_file_path).exists() {
        let mut info_file = fs::File::options()
        .read(true)
        .write(true)
        .create(true).open(&info_file_path).unwrap();
        let mut info_string = String::new();
        
        let result = fs::File::read_to_string(&mut info_file, &mut info_string);
        match result {
            Ok(_)=>{
                let json_value: Value = serde_json::from_str(&info_string).unwrap();

                if json_value[format!("{}-version", &name)].as_str().unwrap_or("") != "" {
                    let old_version = json_value[format!("{}-version", &name)].as_str().unwrap();
                    if old_version == &version {
                        return format!("{} already up to date (version: {})", &name,&version).to_string();
                    } else {
                        return "DOWNLOAD".to_string()
                    }
                } else {
                    return "DOWNLOAD".to_string()
                }
            }
            Err(_)=>{return "DOWNLOAD - Could not read info.json file".to_string()}
        }
    } else {
        return "DOWNLOAD".to_string()
    }
}

#[tauri::command]
pub async fn download_binary(binary_url: String, version: String, path: String) -> String {
    let res = reqwest::get(&binary_url).await;
    let name = binary_url.split('/').last().unwrap();
    let mut message = "".to_string();

    match res {
        Ok(response) => {
            let bytes = response.bytes().await.unwrap();

            fs::create_dir_all(format!("{}/binaries", &path)).unwrap();

            let binary_path = format!("{}/binaries/{}", &path,name);
            let info_file_path = format!("{}/binaries/info.json", &path);

            
            if Path::new(&binary_path).exists() {
                fs::remove_file(&binary_path).unwrap();
            }

            let mut file = fs::File::create_new(&binary_path).unwrap();

            if Path::new(&info_file_path).exists() {
                let mut info_file = fs::File::options()
                .read(true)
                .write(true)
                .create(true).open(&info_file_path).unwrap();
                
                let mut info_string = String::new();
                
                let result = fs::File::read_to_string(&mut info_file, &mut info_string);
                match result {
                    Ok(_)=>{
                        let mut json_value: Value = serde_json::from_str(&info_string).unwrap();

                        if json_value[format!("{}-version", &name)].as_str().unwrap_or("") != "" {
                            let old_version = json_value[format!("{}-version", &name)].as_str().unwrap();
                            if old_version == &version {
                                message += &format!("{} already up to date (version: {}) ", &name,&version).to_string();
                            } else {
                                json_value[format!("{}-version", &name)] = Value::String(version);
                                
                                info_file = fs::File::options()
                                .truncate(true)
                                .write(true)
                                .create(true)
                                .open(&info_file_path).unwrap();

                                let _ = write!(info_file, "{}", serde_json::to_string(&json_value).unwrap_or("".to_string()));   
                            }
                        } else {
                            json_value[format!("{}-version", &name)] = Value::String(version);

                            info_file = fs::File::options()
                                .truncate(true)
                                .write(true)
                                .create(true)
                                .open(&info_file_path).unwrap();
                            let _ = write!(info_file, "{}", serde_json::to_string(&json_value).unwrap_or("".to_string()));   
                        }
                    }
                    Err(_)=>{}
                }
            } else {
                let mut info_file = fs::File::create_new(&info_file_path).unwrap();
                
                let json_value = json!({
                    format!("{}-version", &name): version
                });

                let _ = write!(info_file, "{}", serde_json::to_string(&json_value).unwrap_or("".to_string()));   
            }
            
            file.write_all(&bytes).unwrap();

            message += &format!("{} downloaded", &name);

            if name.contains(".zip") {
                let zip_file = zip::ZipArchive::new(&file);

                match zip_file {
                    Ok(mut result)=>{
                        let _ = result.extract(format!("{}/binaries", &path));
                        let _ = remove_file(&binary_path);
                    }

                    Err(_)=>{}
                }
            }

            return message;
        }
        Err(_) => {
            return format!("Failed to download {}", &name);
        },
    }
    
}

// pub fn convert_bytes(bytes: String) -> String {
//     let units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
//     let mut l = 0;
//     let mut n = bytes.parse().unwrap_or(0);
//     while n >= 1024 {
//         l+=1;
//         n /= 1024;
//     }

//     if n < 10 && l > 0 {
//         return format!("{:.1} {}", n, units[l]);
//     }

//     return format!("{:.0} {}", n, units[l]);
// }
