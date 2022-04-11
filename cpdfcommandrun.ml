(*external foo : unit -> int = "caml_foo"*)

let _ =
  match Filename.basename Sys.argv.(0) with
    "cpdf.top" -> ()
  | _ ->
     (*Printf.printf "foo = %i\n" (foo ());*)
     Cpdfcommand.go ()
