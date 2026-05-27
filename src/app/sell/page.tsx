import SellForm from "../components/SellForm/SellForm";
import Header from "../components/Header/Header";

export default function SellPage() {
    const pageTitle = "出品する";
    const imgSrc = "/sell/picturebutton.png";
    return (
        <div>
            <Header pageTitle={pageTitle} imgSrc={imgSrc}/>

            <SellForm />
        </div>
    );
}
