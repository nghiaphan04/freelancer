def preprocess_text(text: str):
    text = text.lower()

    # remove xuống dòng
    text = text.replace("\n", " ")

    # remove space thừa
    text = " ".join(text.split())

    return text