$(function() {
    $("#submit-btn").click(function(e){
        e.preventDefault();
        if(!$("#usernameInput").val() || !$("#passwordInput").val() || !$("#nameInput").val()){
            alert("Please fill out all fields");
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
                    console.log('success');
                }
            });
        }
    });
});