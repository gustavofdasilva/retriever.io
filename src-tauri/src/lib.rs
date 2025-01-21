// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/


use std::{collections::HashMap, io::{self, BufRead, BufReader, Error, ErrorKind, Read, Write}, process::{Command, Stdio}, thread, time::Duration, vec};

use tauri::AppHandle;


static mut DOWNLOAD_STATUS: String = String::new();

#[tauri::command]
async fn get_metadata(url: String) -> Vec<String> {
    use std::process::Command;

    println!("Received!, lets start");

    let output = Command::new("yt-dlp")
        .arg("--print")
        .arg("title")
        .arg("--print")
        .arg("channel")
        .arg("--print")
        .arg("thumbnail")
        .arg("--print")
        .arg("view_count")
        .arg("--print")
        .arg("like_count")
        .arg("--print")
        .arg("dislike_count")
        .arg("--print")
        .arg("duration_string")
        .arg("--skip-download")
        .arg(url)
        .stdout(Stdio::piped())
        .output().unwrap();

    println!(
        "STDOUT {}",
        String::from_utf8_lossy(&output.stdout).to_string()
    );
    println!(
    "STDERR {}",
        String::from_utf8_lossy(&output.stderr).to_string()
    );
    

    let mut data = Vec::new();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let title = stdout.lines().nth(0).unwrap().to_string();
    let channel = stdout.lines().nth(1).unwrap().to_string();
    let thumbnail = stdout.lines().nth(2).unwrap().to_string();
    let views = stdout.lines().nth(3).unwrap().to_string();
    let likes = stdout.lines().nth(4).unwrap().to_string();
    let dislikes = stdout.lines().nth(5).unwrap().to_string();
    let duration = stdout.lines().nth(6).unwrap().to_string();
    data.push(title);
    data.push(channel);
    data.push(thumbnail);
    data.push(views);
    data.push(likes);
    data.push(dislikes);
    data.push(duration);
    return data;
}

#[tauri::command]
async fn download(
    app: AppHandle,
    url: String, 
    output: String, 
    format: String, 
    fileExt: String, 
    quality: String,
    startSection: String,
    endSection:String,
    goalFileSize: String,
    thumbnailPath: String) -> HashMap<String, String> {
    use std::process::Command;

    

    let mut args: Vec<String> = vec![];

    let quality_number = quality.trim_end_matches('p');

    let is_audio = if format=="Audio" {true} else {false};

    let trim = if startSection == "" || endSection == "" {false} else {true};

    let fileExt_default_handle = if fileExt != "" {fileExt} else {"mp4".to_string()};

    println!("{}",is_audio);

    let mut audio_args:Vec<String> = vec!["-x".to_string(),"--audio-format".to_string(),fileExt_default_handle.clone(),"--audio-quality".to_string(),"0".to_string()];
    
    if trim {
        args.push("--download-sections".to_string());
        args.push(format!("*{startSection}-{endSection}"))
    }

    if is_audio {
        args.append(&mut audio_args);
    }

    if thumbnailPath != "" {
        args.push("--write-thumbnail".to_string());
        args.push("-P".to_string());
        args.push(format!("{thumbnailPath}"));
    }

    // if goalFileSize != "" {
    //     goalFileSize = "10".to_string();
    // }

    args.push("-o".to_string());
    args.push(format!("{output}"));
    args.push("-S".to_string());

    let mut format_sort_arg: Vec<String> = vec![];

    let format_string = format!("ext:{}",fileExt_default_handle);
    let filesize_string = format!("filesize~{}M",goalFileSize);
    
    if quality_number != "Any" && is_audio == false {
        let resolution_string = format!("res:{}",quality_number);
        format_sort_arg.push(resolution_string);
    }
    
    if quality_number != "Any" && is_audio == true {
        let audio_bitrate_string = format!("abr:{}",quality_number);
        format_sort_arg.push(audio_bitrate_string);
    }

    format_sort_arg.push(format_string);
    format_sort_arg.push(filesize_string);
    
    args.push(
        // format!("res:{},ext:{},filesize~{}M",quality_number,fileExt_default_handle,goalFileSize)
        format_sort_arg.join(",")
    );

    args.push("--print".to_string());
    args.push("after_move:filepath".to_string());
    args.push("-q".to_string());

    args.push("--progress".to_string());
    
    args.push(url.clone());

    let mut command = Command::new("yt-dlp");

    let mut child = command
        .args(args.clone())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn().unwrap();

    
    let stdout = child.stdout.take().expect("Falha ao obter stdout");

    std::thread::spawn(move || {
        let mut reader = BufReader::new(stdout);
        let mut buffer = vec![];
        loop {
            let bytes_read = reader.read_until(b'\r', &mut buffer); 

            if bytes_read.unwrap() == 0 {
                break;
            }

            let download_info = String::from_utf8_lossy(&buffer).to_string();
            unsafe{
                DOWNLOAD_STATUS = download_info;
            }

            buffer.clear();
        }
    });

    let status = child.wait().unwrap();
    if status.success() {
        println!("Download concluído com sucesso!");
    } else {
        eprintln!("Erro ao executar o yt-dlp.");
    }


    let output = command.output().unwrap();
    
    println!("ARGS:");
    println!("{}",args.clone().join("\n"));
    
    println!(
        "STDOUT {}",
        String::from_utf8_lossy(&output.stdout).to_string()
    );
    println!(
        "STDERR {}",
        String::from_utf8_lossy(&output.stderr).to_string()
    );

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let output_name = stdout.lines().nth(0).unwrap_or("video");
    
    let mut response: HashMap<String, String> = HashMap::new();

    response.insert("output".to_string(), output_name.to_string());

    return response;
}

#[tauri::command]
fn get_progress_info() -> String {
    unsafe { DOWNLOAD_STATUS.clone() }
}

#[tauri::command]
fn show_in_folder(path: String) {
    #[cfg(target_os = "windows")]
    {
      Command::new("explorer")
          .args([&path]) // The comma after select is not a typo
          .spawn()
          .unwrap();
    }
  
    #[cfg(target_os = "linux")]
    {
      if path.contains(",") {
        // see https://gitlab.freedesktop.org/dbus/dbus/-/issues/76
        let new_path = match metadata(&path).unwrap().is_dir() {
          true => path,
          false => {
            let mut path2 = PathBuf::from(path);
            path2.pop();
            path2.into_os_string().into_string().unwrap()
          }
        };
        Command::new("xdg-open")
            .arg(&new_path)
            .spawn()
            .unwrap();
      } else {
        if let Ok(Fork::Child) = daemon(false, false) {
          Command::new("dbus-send")
              .args(["--session", "--dest=org.freedesktop.FileManager1", "--type=method_call",
                    "/org/freedesktop/FileManager1", "org.freedesktop.FileManager1.ShowItems",
                    format!("array:string:\"file://{path}\"").as_str(), "string:\"\""])
              .spawn()
              .unwrap();
        }
      }
    }
  
    #[cfg(target_os = "macos")]
    {
      Command::new("open")
          .args(["-R", &path])
          .spawn()
          .unwrap();
    }
}

#[tauri::command]
fn delete_file(path: String) {
    #[cfg(target_os = "windows")]
    {
        println!("{}",format!(r##""del "{path}"""##, path = &path).as_str());
      Command::new("cmd")
          .args(["/C", format!(r##""del "{path}"""##, path = &path).as_str()]) // The comma after select is not a typo
          .spawn()
          .unwrap();
    }
  
    #[cfg(target_os = "linux")]
    {
      //Delete command in linux
    }
  
    #[cfg(target_os = "macos")]
    {
      //Delete command in macos
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        // .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_metadata, download, get_progress_info, show_in_folder, delete_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
