import { Data, data } from "./data.js";

function App() {
  const baseCardTemplate = (props: Data) => {
    const { avatarSrc, name, action, timestamp, seen, target } = props;
    return `<div class='flex items-center border-1'>
        <div>
           <img src=${avatarSrc} />
        </div>
        <div class='flex flex-col'>
          <div>
              <span>${name}</span>
              <span>${action}</span>
              ${
                target?.type === "POST"
                  ? `<span class="text-Navy-950">${target.title}</span>`
                  : ``
              }
                 ${
                   target?.type === "GROUP"
                     ? `<span class='text-Blue-950'>${target.name}</span>`
                     : ``
                 }
              ${seen === false ? `<span>안읽음</span>` : ``}
          </div>
          <p>${timestamp}</p>
          ${
            target?.type === "MESSAGE"
              ? `<div class='border-1'>${target.details}</div>`
              : ``
          }
        </div>
        ${
          target?.type === "PICTURE"
            ? `<div class='ml-auto'><img src= ${target.pictureSrc}/></div>`
            : ``
        }
        
      </div>`;
  };

  const allItems = data.map((item) => baseCardTemplate(item)).join(" ");

  document
    .querySelector(".main_section")
    ?.insertAdjacentHTML("afterbegin", allItems);
}

document.body.onload = App;
