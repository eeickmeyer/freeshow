import { OPEN_FILE, REMOTE, STAGE } from "./../../types/Channels"
import { shows } from "../stores"
import { activeFilePath } from "../stores"
import { get } from "svelte/store"
import { output, name, activeShow, language, activeProject, projects, folders } from "../stores"
import { getOutput } from "../components/helpers/get"
import type { RemoteData, RemoteInitialize, RemoteShow } from "../../types/Socket"

export function listen() {
  window.api.receive(OPEN_FILE, (data: any) => {
    console.log(data)
    // activeFilePath = data.path;
    activeFilePath.set(data)
  })
  // window.api.send("OPEN_FILE", {path: 'C:/Users/Kristoffer/Coding/FreeShow/sources.txt'});
  // window.api.send("OPEN_FILE", 'C:/Users/Kristoffer/Coding/FreeShow/sources.txt');
  // window.api.send("OPEN_FILE", {});

  // REMOTE
  window.api.receive(REMOTE, (data: RemoteData) => {
    if (data.channel === "REQUEST") {
      let initialize: RemoteInitialize = {
        id: data.id,
        channel: "DATA",
        data: {
          name: get(name) || "Computer",
          lang: get(language),
          activeShow: get(activeShow),
          activeProject: get(activeProject),
          projects: get(projects),
          folders: get(folders),
        },
      }
      window.api.send(REMOTE, initialize)
    } else if (data.channel === "GET_SHOW") {
      console.log(data)
      let remoteShow: RemoteShow = { id: data.id, channel: "GET_SHOW", data: get(shows)[data.data.id] }
      window.api.send(REMOTE, remoteShow)
    } else {
      console.log("Remote: ", data.id ? data.id + ": " + data.data : data)
    }
  })

  // REQUEST FROM STAGE
  window.api.receive(STAGE, (data: any) => {
    console.log(STAGE, data)
    if (data === "REQUEST") {
      window.api.send(STAGE, { output: getOutput() })
    }
  })

  // TO STAGE
  output.subscribe((data) => {
    if (data !== get(output)) {
      window.api.send(STAGE, { output: getOutput() })
    }
    // TODO: send next slide + countdown + others... / messages
  })
}
