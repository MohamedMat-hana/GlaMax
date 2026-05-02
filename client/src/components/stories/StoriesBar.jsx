/**
 * StoriesBar.jsx — Horizontal scrollable row of circular story bubbles.
 * Displays bilingual title based on current language.
 */

import { useState }       from 'react';
import { useLang }        from '../../context/LangContext';
import { getImageUrl }    from '../../utils/getImageUrl';
import StoriesViewer      from './StoriesViewer';
import './StoriesBar.css';

/** Returns the right title based on lang, supports legacy single-field data */
function storyTitle(story, lang) {
  if (lang === 'en') return story.titleEn || story.titleAr || story.title || '';
  return story.titleAr || story.title || '';
}

/**
 * @param {{ stories: Array }} props
 */
export default function StoriesBar({ stories = [] }) {
  const { lang }             = useLang();
  const [active, setActive]  = useState(null);

  if (!stories.length) return null;

  return (
    <>
      <div className="stories-bar" role="list">
        {stories.map((story, idx) => {
          const title = storyTitle(story, lang);
          return (
            <button
              key={story.id}
              className="story-bubble"
              role="listitem"
              aria-label={title}
              onClick={() => setActive(idx)}
            >
              <span className="story-bubble__ring">
                <span className="story-bubble__inner">
                  {story.img
                    ? <img src={getImageUrl(story.img)} alt={title} />
                    : <span className="story-bubble__emoji">✨</span>
                  }
                </span>
              </span>
              <span className="story-bubble__label">{title}</span>
            </button>
          );
        })}
      </div>

      {active !== null && (
        <StoriesViewer
          stories={stories}
          startIndex={active}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
