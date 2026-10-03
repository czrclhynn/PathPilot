"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>Your workspace hit a small bump.</h1>
      <p>Please try again to continue your journey.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
