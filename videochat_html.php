
<div id='container'>        
    <div id='videos'>        
        <video id='localVideo' autoplay muted></video>
        <video id='remoteVideo' autoplay></video>
    </div>

</div>

<script type="text/javascript">

    $(document).ready(function() {

        $.ajax({
            url: "videochat.php?GetRoom",
            type: "post",
            success: function(room) {

                $('#videoStatus').show();
                $('#roomStatus').html('Connecting to room: ' + room + '<span style="padding-left: 10px;"><i class="fa fa-refresh fa-spin"></i></span>');
                beginVideo(room, function(status, spin) {

                    console.log('status update');
                    if (spin)
                        $('#roomStatus').html(status + '<span style="padding-left: 10px;"><i class="fa fa-refresh fa-spin"></i></span>');
                    else
                        $('#roomStatus').html(status);
                });
            },
            error: function(reason) {

            }
        });
    });

</script>