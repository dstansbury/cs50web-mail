document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener("submit", function(event) {
    // prevents the default behavior of the form, which is to use a get request
    event.preventDefault();
    // call the send email function
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#show-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {
  // Send email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // load the sent mailbox
      load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get the relevant emails from the DB for that mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print the emails to the console for debugging
    console.log(emails);

    // loop through the emails and create a new div element for each email
    emails.forEach(email => {
      // set up a new div for each new element
      const emailDiv = document.createElement('div');

      // give the new div a class name so we can style it in the CSS file
      emailDiv.className = 'email-box';

      // add an event listener to the div so that when it is clicked, the email is opened
      emailDiv.addEventListener('click', () => {
        // call the function to show the email
        show_email(email.id);
        mark_as_read(email.id);        
        });

      // change the background color of the div if the email has been read
      if (email.read) {
        emailDiv.style.backgroundColor = '#f0f0f0';
      }
      else
      {
        emailDiv.style.backgroundColor = '#ffffff';
      };
      
      // add an event listener to the div so that when it is hovered over, the border color changes
      emailDiv.addEventListener('mouseover', () => {
        emailDiv.style.border = '1px solid #24a0ed';
      });

      // event listener so the border color changes back when the mouse leaves the div
      emailDiv.addEventListener('mouseout', () => {
        emailDiv.style.border= '1px solid #ddd';
      });   

      // set the inner HTML of the new div
      emailDiv.innerHTML = `<div class="sender"><strong>From:</strong> ${email.sender}</div>
        <div class="subject"><strong>Subject:</strong> ${email.subject}</div>
        <div class="timestamp">${email.timestamp}</div>`;
      
      // add each emails div to the DOM within the emails-view div
      document.querySelector('#emails-view').append(emailDiv);
    });
  });
}

// show a given email
function show_email(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email to the log
    console.log(email);

    // hide other views and show the show-email view
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#show-email-view').style.display = 'block';

    // display the email in the relevant divs
    document.querySelector('#email-subject').innerHTML = `<h3>${email.subject}</h3>`;
    document.querySelector('#email-sender').innerHTML = `<strong>From:</strong> ${email.sender}`;
    document.querySelector('#email-recipients').innerHTML = `<strong>To:</strong> ${email.recipients}`;
    document.querySelector('#email-timestamp').innerHTML = `<strong>Time:</strong> ${email.timestamp}`;
    document.querySelector('#email-body').innerHTML = `${email.body}`;
});
}

// mark an email as read
function mark_as_read(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}
