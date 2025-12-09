async function loadProjects() {
  const res = await fetch("./data.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load scripts generated data.json");
  }
  const json = await res.json();
  return json.projects || [];
}

interface Project {
  name: string;
  projectSrc: string;
  imgSrc: string;
  tags: string[];
  updatedAt: string;
}

function formatDate(date: string) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderProjects(projects: Project[]) {
  const cardTemplate = ({
    name,
    projectSrc,
    imgSrc,
    tags,
    updatedAt,
  }: Project) => {
    return `<div class="card">
        <a href='${projectSrc}'>
          <img src='${imgSrc}' />
          <div class="card-detail-wrapper">
            <h3>${name}</h3>
            <div class="chip-wrapper">
            ${tags.map((tag) => `<span class="chip">${tag}</span>`).join(" ")}
            </div>
            <span class="updated-date">${formatDate(updatedAt)}</span>
          </div>
        </a>
      </div>`;
  };

  const projectsElements = projects
    .map((project) => cardTemplate(project))
    .join(" ");

  document
    .querySelector(".content")
    ?.insertAdjacentHTML("beforeend", projectsElements);
}

(async function () {
  try {
    const projects = await loadProjects();
    renderProjects(projects);
  } catch (err) {
    console.error(err);
    const container = document.querySelector(".content");
    if (container) {
      container.textContent = "Failed to load projects";
    }
  }
})();
