open Js_of_ocaml

let _ =
  Js.export "cpdflib"
    (object%js
       method setFast = Cpdflib.setFast ()
       method setSlow = Cpdflib.setSlow ()
       val version = Cpdflib.version
    end)
