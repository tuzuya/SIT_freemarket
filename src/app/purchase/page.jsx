import { Suspense } from "react";
import PurchasePageClient from "./PurchasePageClient";

function PurchasePageFallback() {
    return <main>Loading...</main>;
}

export default function PurchasePage() {
    return (
        //useSearchParamsを使ってURLクエリ作成などをしていたので、
        //別ファイルに切り分けて、親のpageからは<Suspense>でラップして呼び出す形に変更した
        <Suspense fallback={<PurchasePageFallback />}>
            <PurchasePageClient />
        </Suspense>
    );
}


