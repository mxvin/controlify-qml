use fltk::{prelude::*, *};
use std::{thread, time};
mod ui;

fn main() {
    let app = app::App::default();
    let mut ui = ui::UserInterface::make_window();
    ui.but.set_callback(move |_| {
        println!("Works!");
        ui.progress.set_maximum(100.0);
        for i in 1..100 {
            ui.progress.set_value(i as f64);
            // thread::sleep(time::Duration::from_secs(1));
            println!("{}", i);
        }
    });
    app.run().unwrap();
    
}