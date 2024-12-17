// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::fmt::Debug;

use serde::de::value::Error;

const defaultDownloadPath: &str = "/downloads";

#[tauri::command]
fn login(user: String, password: String) -> Result<String, String> {
    if user == "tauri" && password == "tauri" {
      // resolve
      Ok("logged_in".to_string())
    } else {
      // reject
      Err("invalid credentials".to_string())
    }
  }

#[tauri::command]
fn get_metadata(url: String) -> Vec<String> {
    use std::process::Command;

    println!("Received!, lets start");

    let output = Command::new("yt-dlp")
        .arg("--print")
        .arg("title")
        .arg("--print")
        .arg("channel")
        .arg("--print")
        .arg("thumbnail")
        .arg(url)
        .output();

        println!("STDOUT {}",String::from_utf8_lossy(&output.as_ref().cloned().unwrap().stdout).to_string());
        println!("STDERR {}",String::from_utf8(output.as_ref().cloned().unwrap().stderr).unwrap_or("null".to_string()));

    let mut data = Vec::new();
    let binding = output.as_ref().cloned().unwrap();
    let stdout = String::from_utf8_lossy(&binding.stdout).to_string();
    let title = stdout.lines().nth(0).unwrap().to_string();
    let channel = stdout.lines().nth(1).unwrap().to_string();
    let thumbnail = stdout.lines().nth(2).unwrap().to_string();
    data.push(title);
    data.push(channel);
    data.push(thumbnail);
    return data;
}
  

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![login])
        .invoke_handler(tauri::generate_handler![get_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
