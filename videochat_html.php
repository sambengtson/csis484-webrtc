
<table>
    <tr>
        <td style="height: 100%; width: 25%">
            <div id="localVideoDiv" class="jumbotron">
                <table>
                    <tr>
                        <td>
                            <video id='localVideo' style="overflow-x: hidden; overflow-y: hidden; margin-top: 5px;" autoplay muted></video>                
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Browser: </label>
                            <label id="browserInfoLabel"></label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>OS: </label>
                            <label id="osLabel"></label>
                        </td>
                    </tr>
                </table>                
            </div>
        </td>
        <td style="width: 100%">
            <div id='videos' class="jumbotron">      

            </div>    
        </td>
    </tr>
</table>

<script type="text/javascript">

    $(document).ready(function() {

        $.ajax({
            url: "videochat.php?GetRoom",
            type: "post",
            success: function(room) {

                $('#videoStatus').show();
                $('#roomStatus').html('Connecting to room: ' + room + '<span style="padding-left: 10px;"><i class="fa fa-refresh fa-spin"></i></span>');
                beginVideo(room, function(status, spin) {
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