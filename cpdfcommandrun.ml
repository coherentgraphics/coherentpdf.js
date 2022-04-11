open Js_of_ocaml

let document = Js.Unsafe.global##.document
let foomod = document##.foo
let foovar = foomod##.foo

let _ =
  match Filename.basename Sys.argv.(0) with
    "cpdf.top" -> ()
  | _ ->
     Printf.printf "foo from foo.foo = %i\n" foovar;
     Cpdfcommand.go ()
