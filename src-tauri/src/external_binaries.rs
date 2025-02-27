use std::{fs, io::{BufReader, Read, Write}};

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
pub async fn get_remote_version_ytdlp() -> String {
    let release_url = "https://github.com/yt-dlp/yt-dlp/releases/latest/";

    let res = reqwest::get(release_url).await;

    match res {
        Ok(response) => {
            
            let version=response.url().path().split('/').last().unwrap(); 
            return version.to_string();
            // let bytes = response.bytes().await.unwrap();
            // let path = format!("./yt-dlp/yt-dlp-{}.exe", version);
            // let mut file = fs::File::create(&path).unwrap();
            // file.write_all(&bytes).unwrap();
            // return path;
        }
        Err(_) => {return "NA".to_string();},
    }
}

#[tauri::command]
pub async fn download_ytdlp(binary_url: String, version: String, path: String) {
    let res = reqwest::get(binary_url.clone()).await;
    let name = binary_url.split('/').last().unwrap();

    match res {
        Ok(response) => {
            let bytes = response.bytes().await.unwrap();
            let path = format!("{}/binaries/{}", path,name);
            let mut file = fs::File::create(&path).unwrap();

            let mut reader = BufReader::new(&bytes[..]);
            let mut buffer = vec![];

            reader.read(&mut buffer).unwrap();

            file.write_all(&bytes).unwrap();
            // return path;
        }
        Err(_) => {},
    }
    
}

pub fn convert_bytes(bytes: String) -> String {
    let units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let mut l = 0;
    let mut n = bytes.parse().unwrap_or(0);
    while n >= 1024 {
        l+=1;
        n /= 1024;
    }

    if n < 10 && l > 0 {
        return format!("{:.1} {}", n, units[l]);
    }

    return format!("{:.0} {}", n, units[l]);
}
