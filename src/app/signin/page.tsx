import SignInForm from "../components/SignInForm/SignInForm";
import Header from "../components/Header/Header";

//Headerに与える引数定義
const pageTitle = "ロ グ イ ン";
const imgSrc = "";

export default function SignInPage(){
    return(
        <main>
            <header>
                <Header pageTitle={pageTitle} imgSrc={imgSrc} />
            </header>
            <SignInForm/>
        </main>
    )
}
