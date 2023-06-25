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
      

      // give the new div a class name so we can style it
      emailDiv.className = 'email-box';

      if (email.read) {
        emailDiv.style.backgroundColor = '#f0f0f0';
      }
      else
      {
        emailDiv.style.backgroundColor = '#ffffff';
      }
      

      emailDiv.innerHTML = `<div class="sender"><strong>From:</strong> ${email.sender}</div>
        <div class="subject"><strong>Subject:</strong> ${email.subject}</div>
        <div class="timestamp">${email.timestamp}</div>`;
      
      document.querySelector('#emails-view').append(emailDiv);
    });
  });
}

