$(function() {

    $("#add-fav-btn").click(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            data: JSON.stringify({recipe_id: location.href.substr(location.href.lastIndexOf("/") + 1)}),
            contentType: 'application/json',
            url: '/addfavorite',                      
            success: function(data) {
                if (data == "success") {
                    $("#add-fav-btn").hide();
                    $("#remove-fav-btn").show();
                } else {
                    alert(data);
                }
            }
        });
    });

    $("#remove-fav-btn").click(function(e){
        e.preventDefault();
        $.ajax({
            type: 'POST',
            data: JSON.stringify({recipe_id: location.href.substr(location.href.lastIndexOf("/") + 1)}),
            contentType: 'application/json',
            url: '/removefavorite',                      
            success: function(data) {
                if (data == "success") {
                    $("#remove-fav-btn").hide();
                    $("#add-fav-btn").show();
                } else {
                    alert(data);
                }
            }
        });
    });

});