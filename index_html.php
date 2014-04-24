<div class="jumbotron" style="width: 100%">
    <div class="container" style="width: 100%">
        <h1>Web-RTC Video Chat</h1>
        <p>We are providing free Web-RTC group video chat as part of an experimental project for a UWRF Senior Seminar project.</p>
        <p>Simply enter a unique room name and connect with anybody in the world!</p>
        <p>
        <form id="roomForm" name="roomForm">
            <div class="input-append">
                <input class="span2" id="roomNameTxt" name="roomNameTxt" type="text" placeholder="Room Name">
                <button class="btn btn-primary" id="startBtn" name="startBtn" type="button">Start Video!</button>
            </div>
        </form>
        </p>
    </div>
</div>

<script type="text/javascript">

    $('#startBtn').click(function() {

        var roomName = $('#roomNameTxt').val();
        if (roomName.length === 0) {

            $('#roomNameTxt').addClass('txtError');
            return;
        }
        else {
            $('#roomNameTxt').removeClass('txtError');
        }
        
        var form = $('#roomForm');
        var serializedData = form.serialize();
        
        $.ajax({
           url: "index.php?SetRoom",
           type: "post",
           data: serializedData,
           success: function(data){
               
               window.location.href = 'videochat.php';
               
           },
           error: function(reason){
       
           }
        });

    });
</script>