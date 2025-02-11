 // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::{
    collections::HashMap, env::args, fs, hash::Hash, io::{ stderr, BufRead, BufReader}, process::{Command, Stdio}, vec
};

use encoding_rs::WINDOWS_1252;

// static mut DOWNLOAD_STATUS: String = String::new();
static mut DOWNLOAD_STATUS: Vec<HashMap<String,String>> = vec![];
static mut ACTIVE_PROCESS: Vec<HashMap<String,String>> = vec![];

#[tauri::command]
async fn get_metadata(url: String, username: String, password: String, cookies_from_browser: String, cookies_txt_file_path: String) -> HashMap<String, String> {
    use std::process::Command;

    println!("Received!, lets start");

    let mut args:Vec<String> = vec![];

    
    if username != "" && password != "" {
        args.push("--username".to_string());
        args.push(username);
        args.push("--password".to_string());
        args.push(password);
    }

    if cookies_from_browser != "" {
        args.push("--cookies-from-browser".to_string());
        args.push(cookies_from_browser);
    } else if cookies_txt_file_path != "" {
        args.push("--cookies".to_string());
        args.push(cookies_txt_file_path);
    }

    args.push("--print".to_string());   
    args.push("title".to_string());
    args.push("--print".to_string());
    args.push("channel".to_string());
    args.push("--print".to_string());
    args.push("thumbnail".to_string());
    args.push("--print".to_string());
    args.push("view_count".to_string());
    args.push("--print".to_string());
    args.push("like_count".to_string());
    args.push("--print".to_string());
    args.push("dislike_count".to_string());
    args.push("--print".to_string());
    args.push("duration_string".to_string());
    args.push("--print".to_string());
    args.push("uploader".to_string());
    args.push("--print".to_string());
    args.push("creator".to_string());
    args.push("--print".to_string());


    args.push("--skip-download".to_string());
    args.push(url);

    println!("{}",args.join(" "));

    let output = Command::new("yt-dlp")
        .args(args)
        .stdout(Stdio::piped())
        .output()
        .unwrap();

    println!(
        "STDERR {}",
        String::from_utf8_lossy(&output.stdout).to_string()
    );
    println!(
        "STDERR {}",
        String::from_utf8_lossy(&output.stderr).to_string()
    );
    
    if String::from_utf8_lossy(&output.stderr).contains("ERROR:") {
        println!(
            "STDERR {}",
            String::from_utf8_lossy(&output.stderr).to_string()
        );

        let formatted_stderr;

        #[cfg(target_os = "windows")]
        {
            (formatted_stderr, _, _) = WINDOWS_1252.decode(&output.stderr);
        }

        let mut response: HashMap<String, String> = HashMap::new();
        response.insert("error".to_string(), formatted_stderr.to_string());

        return response;
    }

    let formatted_output;

    #[cfg(target_os = "windows")]
    {
        (formatted_output, _, _) = WINDOWS_1252.decode(&output.stdout);
    }

    let stdout = formatted_output.to_string();
    let title = stdout.lines().nth(0).unwrap().to_string();
    let channel = stdout.lines().nth(1).unwrap().to_string();
    let thumbnail = stdout.lines().nth(2).unwrap().to_string();
    let views = stdout.lines().nth(3).unwrap().to_string();
    let likes = stdout.lines().nth(4).unwrap().to_string();
    let dislikes = stdout.lines().nth(5).unwrap().to_string();
    let duration = stdout.lines().nth(6).unwrap().to_string();
    let uploader = stdout.lines().nth(7).unwrap().to_string();
    let creator = stdout.lines().nth(8).unwrap().to_string();

    let mut response: HashMap<String, String> = HashMap::new();

    response.insert("title".to_string(), title.to_string());
    response.insert("channel".to_string(), channel.to_string());
    response.insert("thumbnail".to_string(), thumbnail.to_string());
    response.insert("views".to_string(), views.to_string());
    response.insert("likes".to_string(), likes.to_string());
    response.insert("dislikes".to_string(), dislikes.to_string());
    response.insert("duration".to_string(), duration.to_string());
    response.insert("uploader".to_string(), uploader.to_string());
    response.insert("creator".to_string(), creator.to_string());

    return response;
}

#[tauri::command]
async fn download(
    id: String,
    url: String,
    output: String,
    format: String,
    file_ext: String,
    resolution: String,
    bitrate: String,
    start_section: String,
    end_section: String,
    thumbnail_path: String,
    username: String,
    password: String,
    cookies_from_browser: String, 
    cookies_txt_file_path: String
) -> HashMap<String, String> {
    use std::process::Command;

    let download_id: String = id.clone();
    let download_index: usize;
    let process_index: usize;
    unsafe {
        let mut new_download_status: HashMap<String,String> = HashMap::new();
            new_download_status.insert("id".to_string(),id.clone());
            new_download_status.insert("download_status".to_string(), "".to_string());

        let mut new_process: HashMap<String,String> = HashMap::new();
            new_process.insert("id".to_string(), id.clone());
            new_process.insert("process_id".to_string(), "".to_string());


        DOWNLOAD_STATUS.push(new_download_status);
        ACTIVE_PROCESS.push(new_process);

        
        download_index = DOWNLOAD_STATUS.iter().position(
            |download| 
                download.get(&"id".to_string()).unwrap() == &id
        ).unwrap();
        
        process_index = ACTIVE_PROCESS.iter().position(
            |process| 
                process.get(&"id".to_string()).unwrap() == &id
        ).unwrap();
    }

    

    let mut args: Vec<String> = vec![];

    let resolution_num = resolution.trim_end_matches('p');

    let bitrate_num = bitrate.trim_end_matches("kbps");

    let is_audio = if format == "Audio" { true } else { false };

    let trim = if start_section == "" || end_section == "" {
        false
    } else {
        true
    };

    let file_ext_default_handle = if file_ext != "" {
        file_ext
    } else {
        "mp4".to_string()
    };

    println!("{}", is_audio);

    let mut audio_args: Vec<String> = vec![
        "-x".to_string(),
        "--audio-format".to_string(),
        if file_ext_default_handle == "any" {
            "best".to_string()
        } else {
            file_ext_default_handle.clone()
        },
        "--audio-quality".to_string(),
        "0".to_string(),
    ];

    if trim {
        args.push("--download-sections".to_string());
        args.push(format!("*{start_section}-{end_section}"))
    }

    if is_audio {
        args.append(&mut audio_args);
    }

    if username !="" && password !="" {
        args.push("--username".to_string());
        args.push(username);
        args.push("--password".to_string());
        args.push(password);
    }

    

    if cookies_from_browser != "" {
        args.push("--cookies-from-browser".to_string());
        args.push(cookies_from_browser);
    } else if cookies_txt_file_path != "" {
        args.push("--cookies".to_string());
        args.push(cookies_txt_file_path);
    }

    if thumbnail_path != "" {
        args.push("--write-thumbnail".to_string());
        args.push("-P".to_string());
        args.push(format!("{thumbnail_path}"));
    }

    // if goalFileSize != "" {
    //     goalFileSize = "10".to_string();
    // }

    args.push("-o".to_string());
    args.push(format!("{output}.%(ext)s"));

    args.push("-S".to_string());
    let mut format_sort_arg: Vec<String> = vec![];

    if resolution_num != "any" && resolution_num != "" && is_audio == false {
        let resolution_string = format!("res:{}", resolution_num);
        format_sort_arg.push(resolution_string);
    }

    if bitrate_num != "any" && bitrate_num != "" {
        let bitrate_string = format!("tbr:{}", bitrate_num);
        format_sort_arg.push(bitrate_string);
    }

    if file_ext_default_handle != "any" && file_ext_default_handle != "" {
        let format_string = format!("ext:{}", file_ext_default_handle);
        format_sort_arg.push(format_string);
    }

    args.push(
        // format!("res:{},ext:{},filesize~{}M",resolution_num,file_ext_default_handle,goalFileSize)
        format_sort_arg.join(","),
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
        .spawn()
        .unwrap();

        unsafe {
            *ACTIVE_PROCESS[process_index].get_mut("process_id").unwrap() = child.id().to_string();
        }

    let stdout = child.stdout.take().expect("Failed to get stdout");

    std::thread::spawn(move || {
        let mut reader = BufReader::new(stdout);
        let mut buffer = vec![];
        loop {
            let bytes_read = reader.read_until(b'\r', &mut buffer);

            if bytes_read.unwrap() == 0 {
                break;
            }

            let download_info = String::from_utf8_lossy(&buffer).to_string();
            unsafe {
    
                *DOWNLOAD_STATUS[download_index].get_mut("download_status").unwrap() = download_info.clone();
            }

            buffer.clear();
        }
    });

    let status = child.wait().unwrap();
    if status.success() {
        println!("Download succeeded");
    } else {
        let stderr = child.stderr.take().expect("Failed to get stderr");
        let reader = BufReader::new(stderr);

        let mut err_string = String::new();
        reader
            .lines()
            .for_each(|line| err_string.push_str(&format!("{}\n",&line.unwrap().to_string()) ));

        let mut response: HashMap<String, String> = HashMap::new();

        response.insert("error".to_string(), err_string);

        eprintln!("Error while downloading");
        unsafe {
                    
            DOWNLOAD_STATUS.remove(download_index);
            ACTIVE_PROCESS.remove(process_index);
        }
        return response;
    }

    let output = command.output().unwrap();

    println!("ARGS:");
    println!("{}", args.clone().join("\n"));

    println!(
        "STDOUT {}",
        String::from_utf8_lossy(&output.stdout).to_string()
    );
    println!(
        "STDERR {}",
        String::from_utf8_lossy(&output.stderr).to_string()
    );

    let formatted_output;

    #[cfg(target_os = "windows")]
    {
        (formatted_output, _, _) = WINDOWS_1252.decode(&output.stdout);
    }

    let stdout = formatted_output.to_string();
    let output_name = stdout.lines().nth(0).unwrap_or("video");

    let mut response: HashMap<String, String> = HashMap::new();

    response.insert("output".to_string(), output_name.to_string());
    unsafe {

        let download_index = DOWNLOAD_STATUS.iter().position(
            |download| 
                download.get(&"id".to_string()).unwrap() == &download_id).unwrap();
        
        let process_index = ACTIVE_PROCESS.iter().position(
            |process| 
                process.get(&"id".to_string()).unwrap() == &download_id).unwrap();
                
        DOWNLOAD_STATUS.remove(download_index);
        ACTIVE_PROCESS.remove(process_index);
    }
    return response;
}

#[tauri::command]
fn get_progress_info(download_id: String) -> String {
    unsafe { 
    if DOWNLOAD_STATUS.len() == 0 {
        return String::new();
    }

    let download_index = DOWNLOAD_STATUS.iter().position(
        |download| 
            download.get(&"id".to_string()).unwrap() == &download_id.clone()
    ).unwrap();


        return DOWNLOAD_STATUS[download_index].get(&"download_status".to_string()).unwrap().clone();
    }
}

#[tauri::command]
fn show_in_folder(path: String) {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer").args([&path]).spawn().unwrap();
    }

    #[cfg(target_os = "linux")]
    {
        if path.contains(",") {
            let new_path = match metadata(&path).unwrap().is_dir() {
                true => path,
                false => {
                    let mut path2 = PathBuf::from(path);
                    path2.pop();
                    path2.into_os_string().into_string().unwrap()
                }
            };
            Command::new("xdg-open").arg(&new_path).spawn().unwrap();
        } else {
            if let Ok(Fork::Child) = daemon(false, false) {
                Command::new("dbus-send")
                    .args([
                        "--session",
                        "--dest=org.freedesktop.FileManager1",
                        "--type=method_call",
                        "/org/freedesktop/FileManager1",
                        "org.freedesktop.FileManager1.ShowItems",
                        format!("array:string:\"file://{path}\"").as_str(),
                        "string:\"\"",
                    ])
                    .spawn()
                    .unwrap();
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open").args(["-R", &path]).spawn().unwrap();
    }
}

#[tauri::command]
fn delete_file(path: String) {
    let _ = fs::remove_file(path).map_err(|e| format!("Error while deleting file: {}",e));
}

#[tauri::command]
async fn kill_active_process()  {
    #[cfg(target_os = "windows")]
       {
            kill_process_windows();
       }
     
       #[cfg(target_os = "linux")]
       {
         //Kill process command in linux
       }
     
       #[cfg(target_os = "macos")]
       {
         //Kill process command in macos
       }
   }

fn kill_process_windows() {
        // Additional check to ensure all child processes are killed
        let _ = Command::new("wmic")
            .args(&["process", "where", &format!("name='yt-dlp.exe'"), "delete"])
            .output().unwrap();
   }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_metadata,
            download,
            get_progress_info,
            show_in_folder,
            delete_file,
            kill_active_process
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
