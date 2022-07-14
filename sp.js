// @ts-check
// NAME: Controlify
// AUTHOR: mxvin
// VERSION: 0.1
// DESCRIPTION: Module for controlify - A simple floating desktop control to add your current played song to Library or predefined Playlist. Install client native apps for your desktop https://github.com/mxvin/Controlify

/// <reference path="../globals.d.ts" />

//test uri
// 1KzbdOEsrcrBAQatrAv8Ly = jepun
// 2TgQieiA5ezIYcTwfJexEx =  slesh
(function Controlify(){
  const { CosmosAsync, Player, LocalStorage, PopupModal , Topbar} = Spicetify;
  const AppID = "Controlify_Dat"
  var userSettings = {
    uriPls : "2TgQieiA5ezIYcTwfJexEx"
}
  const saveConfig = (opt,value) => {
    userSettings.uriPls = value
    LocalStorage.set(AppID+'_'+opt, value)
  }

  const configHandler = (data) => {
    let opt = Object.keys(data)[0]
    let value = data.opt
    let path = new URL(value).pathname
    let plsBase62 = path.split("/")[1]
    saveConfig(opt,plsBase62)
    
  }

  let configWrapper
  const openConfigPanel = () =>{
    if(!configWrapper){
      configWrapper = document.createElement('div')
      configWrapper.id = "ctrlify-wrapper"

      let plsUrlInput = document.createElement('input')
      plsUrlInput.placeholder = "Playlist to add (share link of playlist) "
      plsUrlInput.onchange = () => configHandler({urlPls: plsUrlInput.value})
      
    }

    PopupModal.display({
      title: "controlify Settings",
      content: configWrapper,
    });


  }
  const configButton = new Topbar.Button("Controlify", "album", () => {
    openConfigPanel()
  });
  
    var socks = new WebSocket("ws://localhost:2299")
    socks.onmessage = function(evt){
        let data = evt.data
        
        switch (data) {
            case "LOVE":
                // TODO : Just pass toggleHeart and then verify if both state in sync
                !( Player.getHeart() ) ? Player.toggleHeart() : false 
                break;
            case "ADDPLS":
                let response = {status: addToPlaylist()}
                socks.send(JSON.stringify(response))
                break;
            default:
                console.log("I don't understand cmd : %s", data)
                break;
        }
    }
    socks.onerror=function(err){console.log(err)}

    var DuplicateCheck = async (uriAudio) => {

        
        /**
         * Cosmos ~/playlist/<uri>/rows: 
         * return => { playlist: {}, rows: [ { link: "spotify:track:trackid" }, ... ], unfilteredLength: rowsN, unrangedLength: rowsN }
         */
        let playlistRows = (await CosmosAsync.get(`sp://core-playlist/v1/playlist/spotify:playlist:${userSettings.uriPls}/rows`, {
            policy: { link: true }
        })).rows

        let dup = playlistRows.find( ({link}) => 
            link === uriAudio
        )

        return (dup ? true : false)
    }

    var addToPlaylist = async () => {
        let uriAudio = Player.data.track.uri
        if (! (await DuplicateCheck(uriAudio)) ){
            CosmosAsync.post(`https://api.spotify.com/v1/playlists/${userSettings.uriPls}/tracks`, 
                {
                    uris:[uriAudio],
                    position:0
                }
            )
            return true
        }else{
            return false
        }
    }
})