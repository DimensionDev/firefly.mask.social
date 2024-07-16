interface SnackbarErrorMessage {
    title: React.ReactNode;
    message: React.ReactNode;
}

export function SnackbarErrorMessage(props: SnackbarErrorMessage) {
    return (
        <div>
            <span className="font-bold">{props.title}</span>
            <br />
            {props.message}
        </div>
    );
}
