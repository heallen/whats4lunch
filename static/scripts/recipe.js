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
                    //hide remove from fav button

                    //indicate that it was added to favorites
                    alert("Added to favorites")
                } else {
                    alert(data);
                }
            }
        });
    });

});