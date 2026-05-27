import { redirect } from "next/navigation";
//このコンポーネントは、玄関口としてデータ取得や転送判断をする場所なので、Server Componentとして扱う。（useclientは使わない）

export default function RootPage(){
    //Todo: Supabase連携後は、ログインしているのかどうかを確認する処理を入れる
    const isLoggedIn = false;

    if(isLoggedIn){
        redirect("/purchase");
    }
    else{
        redirect("/signin");
    }
}
