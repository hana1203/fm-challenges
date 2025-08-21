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
    return `<div key=${id} class='card flex items-center border-1 ${
      !read && "bg-amber-600"
    }'>
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
              ${read === false ? `<span>안읽음</span>` : ``}
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
