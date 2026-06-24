function ArrowIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );
}

function CollectionWindowControls({ currentWindow, totalWindows, onWindowChange, label = "danh sách" }) {
  if (totalWindows <= 1) return null;

  return (
    <div className="collection-window-controls" aria-label={`Chuyển nhóm ${label}`}>
      <button
        type="button"
        className="collection-window-button collection-window-prev"
        onClick={() => onWindowChange(currentWindow - 1)}
        disabled={currentWindow === 0}
      >
        <ArrowIcon />
        <span>Trước</span>
      </button>

      <div className="collection-window-dots" aria-hidden="true">
        {Array.from({ length: totalWindows }, (_, index) => (
          <span key={index} className={index === currentWindow ? "is-active" : ""} />
        ))}
      </div>

      <button
        type="button"
        className="collection-window-button collection-window-next"
        onClick={() => onWindowChange(currentWindow + 1)}
        disabled={currentWindow >= totalWindows - 1}
      >
        <span>Tiếp</span>
        <ArrowIcon />
      </button>
    </div>
  );
}

export default CollectionWindowControls;
