import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// CREATE LOADER FUNCTION 
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

// CREATE TYPING LOGIC 
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval)
    }
  }, 20);
}

// CREATE UNIQUE ID FOR AI RESPONSE
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hexString = randomNum.toString(16);

  return `id-${timeStamp}-${hexString}`;
}

// CREATE STRIP FOR CHAT 
function chatStrip(isAi, value, uniqueId) {
  return (
    `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
  )
}

// HANDLE SUMIT FUNCTION 
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user chat strip 
  chatContainer.innerHTML += chatStrip(false, data.get('prompt'));

  form.reset();

  // bots chat strip 
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStrip(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  // load message container
  loader(messageDiv);

  // fetch data from server 
  const response = await fetch('https://ai-assistant-vvhz.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({ data })

    typeText(messageDiv, parsedData);

  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});