import string
from random import randint

class Decode:
    def __init__(self, code:int):
        self.code = code if code % 2 == 0 else code + 1
        self.mix = string.ascii_letters + string.digits
        self.key = randint(0, len(self.mix))
        self.hash = int(self.code/2) + self.key

    def encode(self, text):
        word = ''
        for i in range(len(text)):
            if i % 2 == 0:
                word += str(self.mix[i - self.hash])
            else:
                word += str(self.mix[i - self.key])
            if self.mix.index(text[i]) % 5 == 0:
                word += str(self.hash - (i * self.code))
            else:
                word += str(self.hash + (i * self.code))
        return word



# Example usage
text = 'awwal'
decoder = Decode(7)
encoded_text = decoder.encode(text)
print("Encoded:", encoded_text)

decoded_text = decoder.decode(encoded_text)
print("Decoded:", decoded_text)
