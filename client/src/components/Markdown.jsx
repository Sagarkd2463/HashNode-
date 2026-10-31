import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Markdown = ({ content = "" }) => {
  return (
    <div className="markdown">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const language = /language-(\w+)/.exec(className || "");

            return language ? (
              <SyntaxHighlighter language={language[1]} style={oneDark}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props}>{children}</code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;