"use client"
import Image from "next/image"
import f1GPTLogo from "./assests/f1gpt-logo.png"
import { useChat } from "ai/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"


const Home = () => {
    const {append, isLoading, messages, input, handleInputChange, handleSubmit} = useChat()

    const noMessages = false

    return (
        <main>
            <Image src={f1GPTLogo} alt="F1GPT Logo" width="2050" />
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The Ultimate place for Formula One super fans!
                            Ask F1GPT anything abaout the fantastic topic of F1 racing
                            and it will come back with the most up-to-date answers.
                            We hope you enjoy!
                        </p>
                        <br/>
                        <PromptSuggestionsRow/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                        {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                    <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me somethng..."/>
                    <input type="submit"/>
                </form>
        </main>
    )
}

export default Home