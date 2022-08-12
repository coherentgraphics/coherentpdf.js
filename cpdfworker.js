importScripts('dist/cpdf.browser.js')

function demo()
{
  postMessage(true);
  setTimeout("demo()",500);
}

demo();
