import { data } from "./data.js";
import { Data } from "./types/data.js";
import { NotificationStore } from "./stores/notificationStore.js";

type CardItem = Omit<Data, "seen"> & {
  read: boolean;
};

function App() {
  const notificationStore = new NotificationStore(data);
  notificationStore.subscribe(() => {
    renderNotificationsCount();
    renderAllItems();
  });

  const cardTemplate = (props: CardItem) => {
    const { id, avatarSrc, name, action, timestamp, target, read } = props;
    return `<div key=${id} class='card flex ${
      !read
        ? "cursor-pointer bg-navy-50 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1 focus:rounded"
        : ""
    }
    rounded-lg py-2 px-4 gap-3'
    ${!read ? 'tabindex="0"' : ""}
    role='button'
    >
        <div class='max-w-10 max-h-10 shrink-0'>
           <img src=${avatarSrc} alt='${name} avatar' />
        </div>
        <div class='flex flex-col'>
          <div>
              <span class='text-navy-950 font-bold cursor-pointer hover:text-blue-950 focus:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1 focus:rounded' tabindex="0">${name}</span>
              <span>${action}</span>
              ${
                target?.type === "POST"
                  ? `<span class="font-semibold cursor-pointer hover:text-blue-950 focus:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1 focus:rounded" tabindex="0">${target.title}</span>`
                  : ``
              }
                 ${
                   target?.type === "GROUP"
                     ? `<span class='font-semibold cursor-pointer hover:text-blue-950 focus:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1 focus:rounded' tabindex="0">${target.name}</span>`
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
              ? `<div class='my-2 p-4 border-1 border-navy-100 rounded-sm cursor-pointer hover:bg-blue-100 focus:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1 focus:rounded' tabindex="0">${target.details}</div>`
              : ``
          }
        </div>
        ${
          target?.type === "PICTURE"
            ? `<div class='ml-auto'><img src= ${target.pictureSrc} alt='${name} attached picture' class='max-w-10 max-h-10 cursor-pointer hover:border-2 border-blue-100 focus:border-2 focus:border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1' tabindex="0" /></div>`
            : ``
        }
        
      </div>`;
  };

  const renderNotificationsCount = () => {
    const notiCount = notificationStore.getUnreadCount();
    const notificationsCountEl = document.querySelector(
      ".notifions_count"
    )! as HTMLElement;
    notificationsCountEl.textContent = String(notiCount);
  };

  const renderAllItems = () => {
    const readState = notificationStore.getReadState();
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
    notificationStore.markAllAsRead();
  });

  const mainSectionEl = document.querySelector(".main_section")! as HTMLElement;

  const markCardAsRead = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const closestCardParentEl = target.closest(".card") as HTMLElement | null;
    if (closestCardParentEl) {
      const key = closestCardParentEl.getAttribute("key") as string;
      notificationStore.markAsRead(key);
    }
  };

  mainSectionEl.addEventListener("click", markCardAsRead);
  mainSectionEl.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      markCardAsRead(e);
    }
  });
}

document.body.onload = App;
