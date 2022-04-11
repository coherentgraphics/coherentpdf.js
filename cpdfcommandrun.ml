open Js_of_ocaml

let foo = Js.Unsafe.global##.foo

let _ =
  match Filename.basename Sys.argv.(0) with
    "cpdf.top" -> ()
  | _ ->
     Printf.printf "foo = %i\n" foo;
     Cpdfcommand.go ()
