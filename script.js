// https://itchampclub.medium.com/linebot-google-apps-script-บันทึกเวลาทำงาน-เข้า-ออก-ac2a85a53f02
const liffId = "2002591337-Zd8Pxrde";
const xurl = "https://script.google.com/macros/s/AKfycbx_JM-oJkuLDXh58Tp1RCBb8sRURgAEvmYS4Zy5b9sSpTiiH6AaOFdwmOD9ArWkLWulag/exec";

// Initialize when document is ready
$(document).ready(() => {
  initializeLiff(liffId);
});

// Initialize LIFF
async function initializeLiff(liffId) {
  try {
    await liff.init({ liffId, withLoginOnExternalBrowser: true });

    // if (liff.getOS() === 'web') {
    //   alert('Access through a web browser is not permitted. Please use our mobile app for the best experience.');
    //   window.location.href = '../404.html';
    // } else {
      handleLiffLogin();
    // }
  } catch (err) {
    console.error('LIFF Initialization failed', err);
  }
}

// Handle LIFF login
function handleLiffLogin() {
  if (!liff.isInClient() && !liff.isLoggedIn()) {
    window.alert("กรุณาเข้าสู่ระบบบัญชี LINE ของคุณ");
    liff.login({ redirectUri: location.href });
  } else {
    getUserProfile();
  }
}

// Get User Profile
async function getUserProfile() {
  try {
    const profile = await liff.getProfile();
    let picture = profile.pictureUrl;
    let xOS = liff.getOS();
    $("#pictureimage").attr("src", picture);
    $("#OS").html(`ระบบปฏิบัติการ ${xOS}`);
  } catch (err) {
    console.error('Error getting profile', err);
  }
}



const x = document.getElementById("demo");

function getLocationin() {
  $('#btn1').hide()
  $('#btn2').show()
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  liff.getProfile().then(function(profile) {
    const { pictureUrl, userId, displayName } = profile;

    const xOS = liff.getOS();
    const email = liff.getDecodedIDToken().email;


      fetch(xurl, {
        method: 'POST',
        contentType: 'application/json',
        // Convert the data object to a string
        body: JSON.stringify({
          ctype: 'In',
          xos: xOS,
          user: userId,
          email: email,
          name: displayName,
          lat: latitude,
          long: longitude,
          picture: pictureUrl
        })
      })
      .then(response => response.json())
      .then(jsonResponse => {
        console.log(jsonResponse)        
        handleServerResponse(jsonResponse, { userId, displayName, email, xOS, pictureUrl });
      })
      .catch(error => console.error('Error:', error));
  })  
  }

function handleServerResponse(jsonResponse, { displayName, email, pictureUrl }) {

  const { desc, msg} = jsonResponse;
  
  $('#btn2').hide()
  $('#btn1').show()
  console.log(msg)
  Swal.fire({
    title: 'บันทึกข้อมูลเรียบร้อย',
    html: `${desc}<br><h3 style="color:red;">คุณต้องแชร์ Location หรือไม่</h3>`,
    icon: 'success',
    showCancelButton: true,
    confirmButtonColor: '#7066e0',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {

        await sendText(msg);

    }else{
      liff.closeWindow(); 
    }
  })
}

async function sendText(text) {
  // Send message based on the environment
  try {
    if (!liff.isInClient()) {
      await shareTargetPicker(text);
    } else {
      await sendMessages(text);
    }
  } catch (error) {
    console.error('Error in sendText:', error);
    window.alert('Error sending message: ' + error.message);
  }
}

async function sendMessages(text) {
  try {
    await liff.sendMessages(text);
   liff.closeWindow(); // Closes the window after sending the message
    // await shareTargetPicker(text);
  } catch (error) {
    console.error('Failed to send message:', error);
    window.alert('Failed to send message: ' + error.message);
  }
}


async function shareTargetPicker(text) {
  try {
    const result = await liff.shareTargetPicker(text);
    if (result) {
      liff.closeWindow(); // Closes the window if the message was sent
    } else {
      console.log('TargetPicker was closed without sending a message.');
    }
  } catch (error) {
    console.error('Error in shareTargetPicker:', error);
    // Handle specific error scenarios if needed
  }
}


