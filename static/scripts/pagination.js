$(function(){
    let url = window.location.href;
    
    var pageNum = 1;
    var base = url.substr(url.indexOf("/", 8))
    if(url.indexOf("/page/") != -1){
        pageNum = parseInt(url.substr(url.lastIndexOf('/') + 1));
        base = base.substr(0, base.indexOf('/', 1));
    }

    $("#next-btn").click(function(){
        window.location.replace(base + "/page/" + (pageNum + 1))
    })

    $("#prev-btn").click(function(){
        window.location.replace(base + "/page/" + (pageNum - 1))
    })
})