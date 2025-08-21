import { Data, data } from "./data.js";

type CardItem = Omit<Data, "seen"> & {
  read: boolean;
};
interface ReadState {
  [key: string]: boolean;
}

function App() {
  const readState = {} as ReadState;
  data.forEach((item) => (readState[item.id] = item.seen));

  const cardTemplate = (props: CardItem) => {
    const { id, avatarSrc, name, action, timestamp, target, read } = props;
    return `<div key=${id} class='card flex ${
      !read ? "cursor-pointer bg-navy-50" : ""
    }
    rounded-lg py-2 px-4 gap-3'>
        <div class='max-w-10 max-h-10 shrink-0'>
           <img src=${avatarSrc} />
        </div>
        <div class='flex flex-col'>
          <div>
              <span class='text-navy-950 font-bold cursor-pointer hover:text-blue-950'>${name}</span>
              <span>${action}</span>
              ${
                target?.type === "POST"
                  ? `<span class="font-semibold cursor-pointer hover:text-blue-950">${target.title}</span>`
                  : ``
              }
                 ${
                   target?.type === "GROUP"
                     ? `<span class='font-semibold cursor-pointer hover:text-blue-950'>${target.name}</span>`
                     : ``
                 }
              ${
                read === false
                  ? `<span class="inline-block w-2 h-2 ml-1 rounded-full bg-red-500"></span>`
                  : ``
              }
          </div>
          <p class='text-gray-500'>${timestamp}</p>
          ${
            target?.type === "MESSAGE"
              ? `<div class='my-2 p-4 border-1 border-navy-100 rounded-sm cursor-pointer hover:bg-blue-100'>${target.details}</div>`
              : ``
          }
        </div>
        ${
          target?.type === "PICTURE"
            ? `<div class='ml-auto'><img src= ${target.pictureSrc} class='max-w-10 max-h-10 cursor-pointer hover:border-2 border-blue-100 rounded-lg' /></div>`
            : ``
        }
        
      </div>`;
  };

  const renderNotificationsCount = () => {
    const notiCount = Object.values(readState).filter(
      (val) => val == false
    ).length;

    const notificationsCountEl = document.querySelector(
      ".notifions_count"
    )! as HTMLElement;
    notificationsCountEl.textContent = String(notiCount);
  };

  const renderAllItems = () => {
    const allItems = data
      .map((item) => cardTemplate({ ...item, read: readState[item.id] }))
      .join(" ");

    const mainSectionEl = document.querySelector(
      ".main_section"
    )! as HTMLElement;
    mainSectionEl.innerHTML = allItems;
  };

  const renderPage = () => {
    renderNotificationsCount();
    renderAllItems();
  };
  renderPage();

  const markAsAllReadEl = document.querySelector(
    ".notifications_read_all"
  )! as HTMLElement;
  markAsAllReadEl.addEventListener("click", () => {
    for (const [key, _] of Object.entries(readState)) {
      readState[key] = true;
    }
    renderPage();
  });

  const mainSectionEl = document.querySelector(".main_section")! as HTMLElement;
  mainSectionEl.addEventListener("click", (e: MouseEvent) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const closestCardParentEl = target.closest(".card") as HTMLElement | null;
    if (closestCardParentEl) {
      const key = closestCardParentEl.getAttribute("key") as string;
      readState[key] = true;
      renderPage();
    }
  });
}

document.body.onload = App;
