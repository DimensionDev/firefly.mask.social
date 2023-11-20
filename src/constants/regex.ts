export const URL_REGEX =
    /\b(http|https):\/\/([\p{L}\p{N}_-]+(?:(?:\.[\p{L}\p{N}_-]+)+))([\p{L}\p{N}_.,@?^=%&:\/~+#-]*[\p{L}\p{N}_@?^=%&\/~+#-])/gu;

export const MENTION_REGEX = /@\w+\/[\w@]+/g;

export const HASHTAG_REGEX = /(#\w*[A-Za-z]\w*)/g;
