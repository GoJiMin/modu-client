type Props = {
  text: string;
};

export function FormattedSummary({text}: Props) {
  const sentences = text.split('. ').filter(s => s.trim().length > 0);

  return (
    <div className="flex flex-col gap-3 text-gray-700 leading-relaxed">
      {sentences.map((sentence, index) => {
        const cleanSentence = sentence.trim();
        const finalSentence = cleanSentence.endsWith('.') ? cleanSentence : `${cleanSentence}.`;

        return (
          <p key={index} className="break-keep">
            {finalSentence}
          </p>
        );
      })}
    </div>
  );
}
