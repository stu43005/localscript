# localscript
run custom script on global context. (used in Google Chrome Extensions)


## 為什麼需要這個腳本?

因為[Content Scripts](https://developer.chrome.com/extensions/content_scripts)無法直接取用網頁定義的變數以及函數，

導致當擴充功能想要取用部分變數或函數時出現問題。

> content scripts have some limitations. They cannot:
> * Use variables or functions defined by their extension's pages
> * Use variables or functions defined by web pages or by other content scripts
