import { useEffect, type RefObject } from "react";

type UseIntersectionLoaderOptions = {
  targetRef: RefObject<Element | null>;
  onIntersect: () => void;
  enabled: boolean;
  rootMargin?: string;
};

export function useIntersectionLoader({
  targetRef,
  onIntersect,
  enabled,
  rootMargin = "0px",
}: UseIntersectionLoaderOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const target = targetRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect, rootMargin, targetRef]);
}
