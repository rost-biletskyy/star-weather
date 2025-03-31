'use client';

type Props = {
    date: number;
};

const LocalDate = ({ date }: Props) => {
    return (
        <span>
            {new Date(date).toLocaleString('en-IN', {
                weekday: 'short',
                hour: 'numeric',
                hour12:true,
                minute: '2-digit',
            })}
        </span>
    );
};

export default LocalDate;
