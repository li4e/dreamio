import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { DiContext } from "shared/di";
import { AppLoader } from "../ui/AppLoader";
import { appDataSource } from "./db";
import { Store } from "./store";

export function DiProvider({ children }: PropsWithChildren) {
  const [dbReady, setDbReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const showLoader = !dbReady || !animationFinished;

  const di = useMemo(() => {
    const store = new Store();

    return {
      store,
      db: appDataSource,
    };
  }, []);

  useEffect(() => {
    if (!di.db.isInitialized) {
      di.db
        .initialize()
        .then(() => {
          setDbReady(true);
        })
        .catch((error) => {
          console.log("DB initialization error", error);
        });
    }
  }, [di.db]);

  if (showLoader) {
    return <AppLoader onAnimationFinish={() => setAnimationFinished(true)} />;
  }

  return <DiContext.Provider value={di}>{children}</DiContext.Provider>;
}
