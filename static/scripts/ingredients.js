$(function(){
    let url = window.location.href;
    
    var pageNum = parseInt(url.substr(url.lastIndexOf('/') + 1))
    if(url.indexOf("/page/") == -1){
        pageNum = 1
    }

    $("#next-btn").click(function(){
        window.location.replace("/ingredients/page/" + (pageNum + 1))
    })

    $("#prev-btn").click(function(){
        window.location.replace("/ingredients/page/" + (pageNum - 1))
    })
})