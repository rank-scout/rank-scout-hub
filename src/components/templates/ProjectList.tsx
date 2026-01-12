import type { ProjectWithCategory } from "@/hooks/useProjects";

interface ProjectListProps {
  projects: ProjectWithCategory[];
}

/**
 * Neutral ProjectList component for Custom HTML Override mode.
 * Contains NO app styling, NO editorial copy, NO UI components.
 * Fully styleable via custom HTML/CSS using provided class hooks.
 */
export default function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="project-list" data-project-count={projects.length}>
      {projects.map((project, index) => (
        <div 
          key={project.id}
          className="project-card"
          data-project-id={project.id}
          data-project-slug={project.slug}
          data-project-index={index}
        >
          <div className="project-card-inner">
            {/* Logo */}
            {project.logo_url && (
              <img 
                src={project.logo_url} 
                alt={`${project.name} Logo`}
                className="project-logo"
                loading="lazy"
              />
            )}

            {/* Content */}
            <div className="project-content">
              <h3 className="project-name">{project.name}</h3>
              
              {project.short_description && (
                <p className="project-description">{project.short_description}</p>
              )}

              {/* Pros */}
              {project.pros_list && project.pros_list.length > 0 && (
                <ul className="project-pros">
                  {project.pros_list.map((pro, i) => (
                    <li key={i} className="project-pro">{pro}</li>
                  ))}
                </ul>
              )}

              {/* Rating */}
              {project.rating && (
                <div className="project-rating" data-rating={project.rating}>
                  {project.rating.toFixed(1)}
                </div>
              )}

              {/* Badge */}
              {project.badge_text && (
                <span className="project-badge">{project.badge_text}</span>
              )}
            </div>

            {/* CTA - plain anchor for full styling control */}
            <div className="project-cta">
              <a 
                href={`/go/${project.slug}`}
                className="project-link"
                data-affiliate={project.affiliate_link ? "true" : "false"}
              >
                Jetzt testen
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
