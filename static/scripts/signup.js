$(function() {

    $("#submit-btn").click(function(e){
        e.preventDefault();
        if(!$("#usernameInput").val() || !$("#passwordInput").val() || !$("#nameInput").val()){
            alert("Please fill out all fields");
        } else if ($("#usernameInput").val().length > 30 
                    || $("#passwordInput").val().length > 30
                    || $("#nameInput").val().length > 30) {
            alert("Please keep each input under 30 characters");
        } else {

            data = {}
            $("#signup-form").serializeArray().map(function(x){data[x.name] = x.value;});
            console.log(data)
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: '/signup',                      
                success: function(data) {
                    if (data == "failure") {
                        alert("Username already taken, please try again");
                        $("#usernameInput").val('')
                        $("#passwordInput").val('')
                        $("#nameInput").val('')
                        $("#usernameInput").focus()
                    } else {
                        window.location.replace("/")
                    }
                }
            });
        }
    });
});