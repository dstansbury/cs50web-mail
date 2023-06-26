document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // logic for the compose form submission
  document.querySelector("#compose-form").addEventListener("submit", function(event) {
    // prevents the default behavior of the form, which is to use a get request
    event.preventDefault();
    // call the send email function
    send_email();
  });
  
  // By default, load the inbox
 load_mailbox('inbox');


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
      add_email(email, mailbox);
  });
  });
}

function add_email(email, mailbox) {
  // set up a new div for each new element
  const emailDiv = document.createElement('div');

  // give the new div a class name so we can style it in the CSS file
  emailDiv.className = 'email-box';

  // add an event listener to the div so that when it is clicked, the email is opened
  emailDiv.addEventListener('click', () => {
    
    // call the function to show the email
    show_email(email.id);
    
    // call the function to mark the email as read
    mark_as_read(email.id);        
    });

  // change the background color of the div if the email has been read
  if (email.read) {
    emailDiv.classList.add('read');
  }
  else
  {
    emailDiv.classList.add('unread');
  }
  
  // add an event listener to the div so that when it is hovered over, the border color changes
  emailDiv.addEventListener('mouseover', () => {
    emailDiv.classList.add('hover');
  });

  // event listener so the border color changes back when the mouse leaves the div
  emailDiv.addEventListener('mouseout', () => {
    emailDiv.classList.remove('hover');
  });   

  // if the mailbox is sent, show the recipients instead of the sender
  if (mailbox === 'sent') {
    // adds a comma between each recipient
    emailDiv.innerHTML = `<div class="sender"><strong>To:</strong> ${email.recipients.join(', ')}</div>
    <div class="subject"><strong>Subject:</strong> ${email.subject}</div>
    <div class="timestamp">${email.timestamp}</div>`;
  }
  // otherwise show the sender
  else {
  emailDiv.innerHTML = `<div class="sender"><strong>From:</strong> ${email.sender}</div>
    <div class="subject"><strong>Subject:</strong> ${email.subject}</div>
    <div class="timestamp">${email.timestamp}</div>`;
  };
  
  // add each emails div to the DOM within the emails-view div
  document.querySelector('#emails-view').append(emailDiv);
};

// show an individual given email
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

    // Generate the HTML for the show-email-view div dynamically
    const showEmailDiv = document.querySelector('#show-email-view');

    showEmailDiv.innerHTML = `
      <div id="email-subject"><h3>${email.subject}</h3></div>
      <div class="email-header-block">
        <div id="email-sender"><strong>From:</strong> ${email.sender}</div>
        <div id="email-recipients"><strong>To:</strong> ${email.recipients}</div>
        <div id="email-timestamp"><strong>Time:</strong> ${email.timestamp}</div>
      </div>
      <div class ="email-body-block">
        <div id="email-body">${email.body}</div>
      </div>
      <div class ="email-action-block">
        <button class="btn btn-sm btn-outline-primary" id="reply-button">Reply</button>
        <button class="btn btn-sm btn-outline-primary" id="archive-button">Archive</button>
        <button class="btn btn-sm btn-outline-primary" id="unarchive-button">Unarchive</button>
      </div>
      `;

    // display the email in the relevant divs
    document.querySelector('#email-subject').innerHTML = `<h3>${email.subject}</h3>`;
    document.querySelector('#email-sender').innerHTML = `<strong>From:</strong> ${email.sender}`;
    document.querySelector('#email-recipients').innerHTML = `<strong>To:</strong> ${email.recipients}`;
    document.querySelector('#email-timestamp').innerHTML = `<strong>Time:</strong> ${email.timestamp}`;
    document.querySelector('#email-body').innerHTML = `${email.body}`;

    // inbox mailbox button logic
    // if the sender is not the current user and the email is unarchived
    // the email is in the inbox: show reply and archive buttons
    if (!email.archived && (email.sender !== document.querySelector('#user-email').innerHTML)) {
      document.querySelector('#unarchive-button').style.display = 'none';
      document.querySelector('#archive-button').style.display = 'inline';
    }

    // archive mailbox button logic
    // if the sender is not the current user and the email is archived
    // the email is in the archive: show reply and unarchive buttons
    else if (email.archived && (email.sender !== document.querySelector('#user-email').innerHTML)) {
      document.querySelector('#unarchive-button').style.display = 'inline';
      document.querySelector('#archive-button').style.display = 'none';
    }

    // sent mailbox button logic
    // if the email is sent by the user, hide the archive and unarchive buttons
    else if (email.sender === document.querySelector('#user-email').innerHTML) {
      document.querySelector('#archive-button').style.display = 'none';
      document.querySelector('#unarchive-button').style.display = 'none';
    };

     // logic for archive button
      document.querySelector("#archive-button").addEventListener("click", function() {
      // call the archive function
      archive_email(email.id);
    });

    // logic for unarchive button
      document.querySelector("#unarchive-button").addEventListener("click", function() {
      // call the unarchive function
      unarchive_email(email.id);
    });

    // logic for reply button
    document.querySelector("#reply-button").addEventListener("click", function() {
      // call the reply function
      reply_email(email);
    });
    
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

// mark an email as archived
function archive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })

  // clean up the view so we don't get duplicates
  .then (() => cleanup())
  // reload the inbox
  .then (() => load_mailbox('inbox'));
 
}

// mark an email as unarchived
function unarchive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })

  // clean up the view so we don't get duplicates
  .then (() => cleanup())

  // reload the inbox
  .then (() => load_mailbox('inbox'));
} 

function reply_email(email) {
  // hide other views and show the compose view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#show-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // add the person to be replied to to the recipients field
  document.querySelector('#compose-recipients').value = email.sender;
  // check if the reply subject already starts with Re: and if not, add it then plug it into the subject field
  if (email.subject.startsWith('Re:')) {
    document.querySelector('#compose-subject').value = email.subject;
  }
  else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  // add the original email body under the intro text specified in the spec
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`;
}

function cleanup() {
  // clean out the emails-view div
  document.querySelector('#emails-view').innerHTML = '';
  // clean out the show-email-view div
  document.querySelector('#show-email-view').innerHTML = '';
}

});
 